

var UserProfile = function( profileData ) {
    if( !profileData ) {
        throw new Error("Profile Data is required.");
    }

    this.uid = profileData.uid;
    this.attributes = profileData;
};

UserProfile.prototype.setAttributes = function( theAttributes ) {
    this.uid = profileData.uid;
    this.attributes = theAttributes;
};

UserProfile.prototype.getAttributes = function() {
    return this.attributes || {};
};

UserProfile.prototype.set = function(attributeName, attributeValue) {
  this.attributes[attributeName] = attributeValue;
};

/**
 *
 * {
        "country_code": "United States",
        "region_code": "NY",
        "latitude": 40.7459421968467,
        "longitude": -74.00576971478202,
        "city": "New York",
        "zipcode": "10011"
    }
 * @returns {last_location|{}|*}
 */
UserProfile.prototype.getLastLocation = function() {
    return this.attributes.last_location;
};

UserProfile.prototype.setLastLocation = function( locationData ) {
    this.attributes.last_location = locationData;
};

UserProfile.prototype.getHomeLocation = function() {
    return this.attributes.home_location;
};

UserProfile.prototype.setHomeLocation = function( homeLocation ) {
    this.attributes.home_location = homeLocation;
    if( homeLocation.city ) {
        this.attributes.location_name = homeLocation.city;
        if( homeLocation.region_code ) {
            this.attributes.location_name = homeLocation.city + ', ' + homeLocation.region_code;
        }
    }
};

UserProfile.prototype.getName = function() {
    return this.attributes.name;
};

UserProfile.prototype.setName = function( name ) {
    this.attributes.name = name;
};

UserProfile.prototype.getGender = function() {
    return this.attributes.gender;
};

UserProfile.prototype.setGender = function( gender ) {
    this.attributes.gender = gender;
};

UserProfile.prototype.getBirthday = function() {
    return this.attributes.birthday;
};

UserProfile.prototype.setBirthday = function( birthday ) {
    this.attributes.birthday = birthday;
};

UserProfile.prototype.getPhotoUrl = function() {
    return this.attributes.photoUrl;
};

UserProfile.prototype.setPhotoUrl = function( photoUrl ) {
    this.attributes.photoUrl = photoUrl;
};

module.exports = UserProfile;
