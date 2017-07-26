function getFriendlyPhoneNumber(phoneNumber) {
  // TODO: make this format the phone number into (415)555-5555
  return getPhoneNumberWithoutCountryCode(phoneNumber);
}
module.exports.getFriendlyPhoneNumber = getFriendlyPhoneNumber;

function getPaddedCountryCodePhoneNumber(phoneNumber) {
  if(!phoneNumber) {
    return;
  }
  if(typeof phoneNumber !== 'string') {
    phoneNumber = phoneNumber.toString();
  }
  if(phoneNumber[0] === '+') {
    phoneNumber = phoneNumber.slice(1);
  }
  while(phoneNumber.length < 13) {
    phoneNumber = '0' + phoneNumber;
  }
  phoneNumber = '+'+phoneNumber;
  return phoneNumber;
}
module.exports.getPaddedCountryCodePhoneNumber = getPaddedCountryCodePhoneNumber;

function getUnpaddedCountyCodePhoneNumber(phoneNumber) {
  if(!phoneNumber) {
    return;
  }
  if(typeof phoneNumber !== 'string') {
    phoneNumber = phoneNumber.toString();
  }
  if(phoneNumber[0] === '+') {
    phoneNumber = phoneNumber.slice(1);
  }
  while(phoneNumber[0] === '0') {
    phoneNumber = phoneNumber.slice(1);
  }
  phoneNumber = '+' + phoneNumber;
  return phoneNumber;
}
module.exports.getUnpaddedCountyCodePhoneNumber = getUnpaddedCountyCodePhoneNumber;

function getPhoneNumberWithoutCountryCode(phoneNumber) {
  if(phoneNumber[0] === '+') {
    return phoneNumber.slice(4);
  }
  return phoneNumber;
}
module.exports.getPhoneNumberWithoutCountryCode = getPhoneNumberWithoutCountryCode;

function getCountryCode(phoneNumber) {
  var countryCode = "";
  if(phoneNumber[0] === '+') {
    countryCode = phoneNumber.slice(1, 4);
    while(countryCode[0] === '0') {
      countryCode = countryCode.slice(1);
    }
  }
  return countryCode;
}
module.exports.getCountryCode = getCountryCode;
