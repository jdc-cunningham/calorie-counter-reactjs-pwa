export function isObject( thing ) {
  if ( (typeof thing === "object" || typeof thing === 'function') && (thing !== null) ) {
    return true;
  } else {
    return false;
  }
}

export const getDateTime = (format = "") => {
  // from https://stackoverflow.com/questions/8083410/how-can-i-set-the-default-timezone-in-node-js
  process.env.TZ = "America/Chicago";
  let date_ob = new Date();

  // current date
  // adjust 0 before single digit date
  let date = ("0" + date_ob.getDate()).slice(-2);

  // current month
  let month = ("0" + (date_ob.getMonth() + 1)).slice(-2);

  // current year
  let year = date_ob.getFullYear();

  // current hours
  let hours = date_ob.getHours();

  // current minutes
  let minutes = date_ob.getMinutes();

  // current seconds
  let seconds = date_ob.getSeconds();
  
  if (format === "YYYY-MM-DD") {
    return `${year}-${month}-${date}`;
  }

  if (format === "MM-DD-YYYY") {
    return `${month}-${date}-${year}`;
  }

  if (format === "MM/DD/YYYY") {
    return `${month}/${date}/${year}`;
  }

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
}