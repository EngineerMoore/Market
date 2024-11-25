const bcrypt = require(`bcrypt`);

const { PrismaClient } = require(`@prisma/client`);
const prisma = new PrismaClient().$extends({
  model: {
    user: {
      async register(username, password){

        // owasp requires a minimum of 10 salts
        const hashedPassword = await bcrypt.hash(password, 10) 
        const user = await prisma.user.create({
          data: {
            username: username,
            password: hashedPassword,
          }
        });
        // allows the user object to be utilized after using register method
        return user;
      },

      async login(username, password){
        const user = await prisma.user.findUniqueOrThrow({
          where: { username },
        });

        // bcrypt.compare() returns true or false
        const comparePassword = await bcrypt.compare(password, user.password);

        //Throw statement: throw sets the error message
        if (!comparePassword) throw Error(`Incorrect Password.`);

        return user;
      },
    },
  },
})

module.exports = prisma;