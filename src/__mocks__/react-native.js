module.exports = {
  Platform: {
    OS: "android",
    select: (objs) => objs.android || objs.default,
  },
};
