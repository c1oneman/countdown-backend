module.exports = (mongoose) => {
  var schema = mongoose.Schema(
    {
      _id: String,
      title: String,
      expires: Date,
    },
    { timestamps: true }
  );
  schema.index({ expires: 1 }, { expireAfterSeconds: 60 });

  schema.method("toJSON", function () {
    const { __v, _id, ...object } = this.toObject();
    object.id = _id;
    return object;
  });

  const Timer = mongoose.model("timers", schema);
  return Timer;
};
