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

The API runs at https://pontoonapps.com/community-api (referred to as `<root>` below) . Data structures and authentication mechanisms are detailed in further sections. The main routes are:

### Map Pin routes

* GET `<root>/pins` – return array of all pins visible to this user
* POST `<root>/pins` – add a user pin (accepts JSON)
  * if the user already has a pin with this name, the pin information is all updated
  * returns 204 No Content on success
  * returns 400 Bad Request when data is malformed
* POST `<root>/pins/delete` – remove a pin identified by name and created by the calling user (accepts JSON)
  * the incoming JSON should only be `{ "name": "..." }`
  * a user can only delete their own pins
  * returns 204 No Content on success (even if pin with the name didn't exist)
  * returns 400 Bad Request when data is malformed

#### Data structures

A pin is represented in the API with the following data structure:
```
{
  name:                      String (max 40 chars) – unique for the user,
  latitude:                  Number,
  longitude:                 Number,
  category:       (optional) Number,
  description:    (optional) String (max 255 chars),
  phone:          (optional) String (max 25 chars),
  website:        (optional) String (max 255 chars),
  email:          (optional) String (max 255 chars),
  address_line_1: (optional) String (max 255 chars),
  address_line_2: (optional) String (max 255 chars),
  postcode:       (optional) String (max 12 chars),
  notes:          (optional) String (max 255 chars),
}
```

A pin returned by the API can also have a field `userPin` (Boolean) – `true` if this pin was submitted by the user, and `false` if it comes from their training centre.


### Training Centre routes:

These routes return `403 Forbidden` if the current user is not a training centre (role "recruiter").

* GET `<root>/training-centre/users` – return array of emails of the users assigned to the authenticated training centre
* POST `<root>/training-centre/users` – add (assign) and remove (unassign) users to this training centre. Input data:
  ```
  {
    add:     (optional)  [ email strings ],
    remove:  (optional)  [ email strings ],
  }
  ```
  - removal is processed first, then addition – if both arrays contain the same email address, the user will be added;
  - users that do not exist in the database will be ignored (the client should report the email addresses that weren't added);
  - users that are already assigned to a different training centre will be ignored (a user can only be assigned to one training centre);
  - removing users that were not assigned to the training centre is also ignored;
  - returns the result list of users assigned to the training centre (like the GET method above).


### Status and check routes:

* GET `<root>/` – returns a successful response if the API is running (no authentication needed)
* GET `<root>/ping` – returns a successful response if the API key is accepted (only API key needed)
* GET `<root>/login` – returns information about the user, in the following format:
  ```
  {
    role:                "user" or "recruiter",
    training_centre: {
        email:           String,
        name: {
          first:         String,
          last:          String,
        }
      }
  }
  ```
  - notes
    - in pontoonapps, training centres have "recruiter" role;
    - `training_centre` is there only if the role is "user" and the user is assigned to a training centre.

### Authentication

The API must only be accessed over HTTPS.

The API uses an **API key provided as a URL query parameter** `apiKey`; this key should be kept privately by the developers of the mobile app(s). If a key is found to be misused, it can be revoked. With the wrong key, the API returns 403 Forbidden.

If your key is ABCDEFGH, you can check the API at https://pontoonapps.com/community-api/ping?apiKey=ABCDEFGH

Users in the app use their pontoonapps.com account details. The app uses these account details (email and password) with **HTTP Basic Authentication** in all API requests (except `ping`). Without valid credentials, the API returns 401 Unauthorized.

Any registered pontoon.com user can request their map pins at `<root>/pins`; if they have never submitted any, this will return an empty array.

_NB: There is no dedicated login API call, and there are no sessions._




## Assumptions

* pontoonapps.com always uses HTTPS, which should be sufficient for network security (in particular, it should be OK to use Basic Auth)
* pontoonapps.com recruiters act as training centres for the community map API.

## To-Do

### adding training centres

* training centres
  * questions and assumptions:
    - should training centres be able to find out user name for nicer display? (assumption: no)
    - what should happen if a user is already assigned to another training centre? (assumption: they should ask the previous training centre to remove them first; alternative: they could remove themselves from a training centre)
      - this means the app should check all the email addresses it meant to add and if some aren't added, either the address is wrong or it's assigned to a different training centre already
    - should user be able to find out which training centre they are connected to? (assumption: yes)
    - as part of the above, should the user be able to find out some things about the training centre? (assumption: first name, last name, email)

### future considerations

* make lat/lon NOT NULL in SQL
* recognized API keys probably could be in the database rather than in the config file
* check that in cpanel we can't have more fine-grained access control than db-wide privileges
