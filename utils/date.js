const convertTimestampToDate = (timestamp) => {
  const date = new Date(timestamp._seconds * 1000);
  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return date.toLocaleDateString("id-ID", options);
};


module.exports = convertTimestampToDate;