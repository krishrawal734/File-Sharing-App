/* global jest */
module.exports = {
  getIpAddressAsync: jest.fn().mockResolvedValue("192.168.1.100"),
  getNetworkStateAsync: jest.fn().mockResolvedValue({
    isConnected: true,
    isInternetReachable: true,
  }),
};
