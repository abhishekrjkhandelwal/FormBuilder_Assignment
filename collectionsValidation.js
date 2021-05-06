db.runCommand({ 
    colMod: 'user', 
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['name', 'email', 'gender', 'createdAt'],
        properties: {
          name: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          email: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          gender: {
            bsonType: 'string',
            description: 'must be an string and is required'
          },
          createdAt: {
              bsonType: 'string',
              description: 'must be an string and is required'
          }
        }
      }
    },
    validationAction: "error",
});


db.runCommand({ 
    colMod: 'userDetails',
    validator: {
      $jsonSchema: {
        bsonType: 'object',
        required: ['birthDate', 'adhaarNumber', 'address', 'mobileno', 'country'],
        properties: {
          birthDate: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          adhaarNumber: {
            bsonType: 'string',
            description: 'must be a string and is required'
          },
          address: {
            bsonType: 'string',
            description: 'must be an string and is required'
          },
          mobileno: {
              bsonType: 'string',
              description: 'must be an number and is required'
          },
          country: {
              bsonType: 'string',
              description: 'must be an number and is required'
          }
        }
      }
    },
    validationAction: 'warn',
});