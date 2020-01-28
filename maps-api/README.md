# PONToon Community Map App API

This is a Node.js-based API, backed in MySQL, that contains map _pins_ submitted by users and provided by users' training centers.

This API is meant to support a mobile app.

## Installation

If you want to install the API at pontoonapps.com:

0. create a Node.js application in the cpanel
1. `npm install` to load all dependencies
2. make sure there's a MySQL database user available for this API implementation to use
  * the database must contain the table `users` (as per PONToonapps.com)
  * the database must contain the table `map_pins` (see `sql-init.sql` to create it)
  * the database user should be suitably constrained (only select from `users`, select/insert/update/delete in `map_pins`)
3. edit `config.json` (possibly create one from `config-template.json`)
  * create and give _API keys_ to app developer(s)


## API structure

The API runs on pontoonapps.com (initially at https://pontoonapps.com/testnodeapi2/ ). Data structures and authentication mechanisms are detailed further below.

* GET `<root>/ping` – returns a successful response if the API key is accepted
* GET `<root>/pins` – return array of all pins visible to this user
* POST `<root>/pins` – add a user pin (accepts JSON)
* POST `<root>/pins/delete` – remove a pin identified by name and created by the calling user (a user can only delete their own pins) – the incoming JSON should only be `{ name: ... }`

### Data structures

A pin is represented in the API with the following data structure:
```
{
  name:                      String (max 40 chars) – unique for the user,
  category:       (optional) Number,
  description:    (optional) String (max 255 chars),
  phone:          (optional) String (max 25 chars),
  website:        (optional) String (max 255 chars),
  email:          (optional) String (max 255 chars),
  address_line_1: (optional) String (max 255 chars),
  address_line_2: (optional) String (max 255 chars),
  postcode:       (optional) String (max 12 chars),
  latitude:       (optional) Number,
  longitude:      (optional) Number,
  notes:          (optional) String (max 255 chars),
}
```

A pin returned by the API can also have a field `userPin` (Boolean) – `true` if this pin was submitted by the user, and `false` if it comes from their training centre.


### Authentication

The API must only be accessed over HTTPS.

The API uses an API key; this key should be kept privately by the developers of the mobile app(s). If a key is found to be misused, it can be revoked.

Users in the app use their pontoonapps.com account details. The app uses these account details (email and password) with HTTP Basic Authentication in all API requests. _There is no login functionality, and there are no sessions._




## Assumptions

* pontoonapps.com always uses HTTPS, which prevents replay attacks.
* training centres can easily be added as a special type of user, with an extra DB table that ties normal users to their training centre(s)

## To-Do

* read again spec from Niall Fraser to see if we cover everything
* recognized API keys probably could be in the database rather than in the config file
* users are not connected to training centres yet so the API does not return any training centre pins
* remove `testCount` functionality
* handle the possibility of broken MySQL connection (pools seem to solve that)