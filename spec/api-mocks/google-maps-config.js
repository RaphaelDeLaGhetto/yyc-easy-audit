module.exports = [
  {
    /**
     * regular expression of URL
     */
    //pattern: 'https://domain.example(.*)',
//    pattern: `https://www.googleapis.com/geolocation/v1/geolocate?key=${process.env.GEOCODE_API}`,
    pattern: `https://maps.googleapis.com/maps/api/geocode/json`,

    /**
     * returns the data
     *
     * @param match array Result of the resolution of the regular expression
     * @param params object sent by 'send' function
     * @param headers object set by 'set' function
     * @param context object the context of running the fixtures function
     */
    fixtures: function(match, params, headers, context) {
      /**
       * Checking on parameters example:
       *   request.get('https://domain.example/hero').send({superhero: "superman"}).end(function(err, res){
       *     console.log(res.body); // "Your hero: superman"
       *   })
       */
//      if (!params.email_address) {
//        throw new Error({ status: 400 }); // Bad Request
//      }
//
//      if (params.status !== 'subscribed') {
//        throw new Error({ status: 400 }); // Bad Request
//      }
//
//      if (!params.merge_fields.FNAME || !params.merge_fields.LNAME) {
//        throw new Error({ status: 400 }); // Bad Request
//      }
//
//      /**
//       * Checking on headers example:
//       *   request.get('https://domain.example/authorized_endpoint').set({Authorization: "9382hfih1834h"}).end(function(err, res){
//       *     console.log(res.body); // "Authenticated!"
//       *   })
//       */
//      if (headers['Content-Type'] !== 'application/json;charset=utf-8') {
//        throw new Error({ status: 400 }); // Bad Request
//      }
//
//      if (headers['Authorization'] !== `Basic ${new Buffer('any:' + process.env.MAIL_CHIMP_KEY).toString('base64')}`) {
//        throw new Error({ status: 401 }); // Unauthorized 
//      }
    },

/**
     * returns the result of the GET request
     *
     * @param match array Result of the resolution of the regular expression
     * @param data  mixed Data returns by `fixtures` attribute
     */
    get: function (match, data) {
      return { body: require('./google-sample-geocode-response.json') }; 
    }
  },
];
