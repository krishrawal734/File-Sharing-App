import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import * as ReactMock from "react";
import SelectFilesScreen from "../files";
import * as FileSystem from "expo-file-system/legacy";
import * as DocumentPicker from "expo-document-picker";
import { Alert } from "react-native";
import { router } from "expo-router";
import { clearSharedFiles, copyFileToServer, removeSharedFile } from "../../../server/localServer";

jest.mock("react", () => {
  const hooks: unknown[] = [];
  let cursor = 0;
  return {
    __esModule: true,
    default: { createElement: (type: unknown, props: unknown, ...children: unknown[]) => ({ type, props: { ...props as object, children } }) },
    useState: (initial: unknown) => {
      const index = cursor++;
      if (index >= hooks.length) hooks[index] = initial;
      return [hooks[index], (next: unknown) => { hooks[index] = next; }];
    },
    useRef: (initial: unknown) => {
      const index = cursor++;
      if (index >= hooks.length) hooks[index] = { current: initial };
      return hooks[index];
    },
    startRender: () => { cursor = 0; },
    resetHooks: () => { hooks.length = 0; cursor = 0; },
    memo: (component: unknown) => component,
    useEffect: () => {},
  };
});
jest.mock("react/jsx-runtime", () => ({
  jsx: (type: unknown, props: unknown) => ({ type, props }),
  jsxs: (type: unknown, props: unknown) => ({ type, props }),
  Fragment: "Fragment",
}));
jest.mock("react-native", () => ({
  Alert: { alert: jest.fn() },
  ScrollView: "ScrollView",
  Text: "Text",
  View: "View",
  TouchableOpacity: "TouchableOpacity",
  ActivityIndicator: "ActivityIndicator",
}));
jest.mock("react-native-safe-area-context", () => ({ SafeAreaView: "SafeAreaView" }));
jest.mock("expo-status-bar", () => ({ StatusBar: "StatusBar" }));
jest.mock("@expo/vector-icons", () => ({ MaterialCommunityIcons: "MaterialCommunityIcons" }));
jest.mock("expo-router", () => ({ router: { push: jest.fn() } }));
jest.mock("../../../components/AppHeader", () => "AppHeader");
jest.mock("../../../components/FileCard", () => "FileCard");
jest.mock("../../../components/BottomNavigation", () => "BottomNavigation");
jest.mock("../../../server/localServer", () => ({
  clearSharedFiles: jest.fn(),
  copyFileToServer: jest.fn(),
  removeSharedFile: jest.fn(),
}));
jest.mock("expo-file-system/legacy", () => ({
  documentDirectory: "file:///documents/",
  getInfoAsync: jest.fn(),
  readDirectoryAsync: jest.fn(),
}));
jest.mock("expo-document-picker", () => ({ getDocumentAsync: jest.fn() }));

type Node = { type: string; props: Record<string, any> };
const nodes = (root: unknown, type: string): Node[] => {
  if (Array.isArray(root)) return root.flatMap((child) => nodes(child, type));
  if (!root || typeof root !== "object") return [];
  const element = root as Node;
  return [...(element.type === type ? [element] : []), ...nodes(element.props?.children, type)];
};
const render = () => {
  (ReactMock as unknown as { startRender: () => void }).startRender();
  return SelectFilesScreen();
};
const buttons = () => nodes(render(), "TouchableOpacity");
const cards = () => nodes(render(), "FileCard");
const doc = (name: string) => ({ name, uri: `file:///cache/${name}`, size: 123, mimeType: "text/plain", lastModified: 0 });
const select = async (...names: string[]) => {
  jest.mocked(DocumentPicker.getDocumentAsync).mockResolvedValueOnce({ canceled: false, assets: names.map(doc) });
  await buttons()[0].props.onPress();
};

beforeEach(() => {
  (ReactMock as unknown as { resetHooks: () => void }).resetHooks();
  jest.clearAllMocks();
  jest.mocked(FileSystem.getInfoAsync).mockResolvedValue({ exists: false, isDirectory: false, uri: "file:///documents/shared-files/" });
  jest.mocked(FileSystem.readDirectoryAsync).mockResolvedValue([]);
  jest.mocked(copyFileToServer).mockResolvedValue("file:///documents/shared-files/");
  jest.mocked(removeSharedFile).mockResolvedValue(undefined);
  jest.mocked(clearSharedFiles).mockResolvedValue(undefined);
});

describe("sender file selection", () => {
  it("keeps the first batch shared and copies the next batch in order", async () => {
    await select("one.txt", "two.txt");
    await select("three.txt");
    expect(clearSharedFiles).not.toHaveBeenCalled();
    expect(jest.mocked(copyFileToServer).mock.calls.map((call) => call[1])).toEqual(["one.txt", "two.txt", "three.txt"]);
    expect(cards().map((card) => card.props.file.name)).toEqual(["one.txt", "two.txt", "three.txt"]);
  });

  it("rejects duplicate names before copying, including a file already on disk", async () => {
    await select("dupe.txt", "dupe.txt");
    expect(copyFileToServer).not.toHaveBeenCalled();
    await select("one.txt");
    await select("one.txt");
    expect(copyFileToServer).toHaveBeenCalledTimes(1);
    jest.mocked(FileSystem.getInfoAsync).mockResolvedValue({ exists: true, isDirectory: true, uri: "file:///documents/shared-files/", modificationTime: 0, size: 0 });
    jest.mocked(FileSystem.readDirectoryAsync).mockResolvedValue(["old.txt"]);
    await select("old.txt");
    expect(copyFileToServer).toHaveBeenCalledTimes(1);
    expect(cards()).toHaveLength(1);
    expect(Alert.alert).toHaveBeenCalledWith("Sharing Failed", expect.stringContaining("already shared"));
  });

  it("does not show failed copies and cleans up a partial destination", async () => {
    jest.mocked(copyFileToServer).mockRejectedValueOnce(new Error("disk full"));
    await select("bad.txt", "good.txt");
    expect(removeSharedFile).toHaveBeenCalledWith("bad.txt");
    expect(cards().map((card) => card.props.file.name)).toEqual(["good.txt"]);
    expect(Alert.alert).toHaveBeenCalledWith("Copy Failed", expect.stringContaining("disk full"));
  });

  it("unshares on remove and clear, but keeps files in the list if unsharing fails", async () => {
    await select("one.txt", "two.txt");
    jest.mocked(removeSharedFile).mockRejectedValueOnce(new Error("unlink failed"));
    await cards()[0].props.onRemove(cards()[0].props.file.id);
    expect(cards()).toHaveLength(2);
    await cards()[0].props.onRemove(cards()[0].props.file.id);
    expect(removeSharedFile).toHaveBeenLastCalledWith("one.txt");
    expect(cards().map((card) => card.props.file.name)).toEqual(["two.txt"]);
    jest.mocked(clearSharedFiles).mockRejectedValueOnce(new Error("clear failed"));
    await buttons()[1].props.onPress();
    expect(cards()).toHaveLength(1);
    await buttons()[1].props.onPress();
    expect(cards()).toHaveLength(0);
  });

  it("blocks another pick and Continue while a copy is pending", async () => {
    let finishCopy!: (value: string) => void;
    jest.mocked(copyFileToServer).mockImplementationOnce(() => new Promise((resolve) => { finishCopy = resolve; }));
    const picking = select("slow.txt");
    await Promise.resolve();
    await Promise.resolve();
    expect(buttons().at(-1)?.props.disabled).toBe(true);
    await buttons()[0].props.onPress();
    buttons().at(-1)?.props.onPress();
    expect(DocumentPicker.getDocumentAsync).toHaveBeenCalledTimes(1);
    expect(router.push).not.toHaveBeenCalled();
    finishCopy("file:///documents/shared-files/slow.txt");
    await picking;
    buttons().at(-1)?.props.onPress();
    expect(router.push).toHaveBeenCalledWith("/send/devices");
  });
});
