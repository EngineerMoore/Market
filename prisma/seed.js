const prisma = require(`../prisma`);
const { faker } = require(`@faker-js/faker`);


const seed = async (numUsers = 5, numProducts = 20, numOrders = 10) => {
  const users = Array.from({length: numUsers}, () => ({
    username: faker.internet.username(),
    password: faker.internet.password(),
  }));
  await prisma.user.createMany({ data: users })


  const products = Array.from({length: numProducts}, () => ({
    title: faker.commerce.product(),
    description: faker.commerce.productDescription(),
    price: +faker.commerce.price(),
  }))
  await prisma.product.createMany({ data: products })

  for (let i = 0; i < numOrders; i++){
    const randomIntAboveZero = (amount) => Math.ceil(Math.random()*amount);

    const selectedProducts = Array.from({length: 5}, () => ({ id: randomIntAboveZero(numProducts) }));

    await prisma.order.create({
      data: {
        date: `${faker.date.recent()}`,
        note: faker.location.streetAddress(),
        customerId: randomIntAboveZero(numUsers),
        items: { connect: selectedProducts },
      },
    });
  };
}
seed()
  .then( async () => await prisma.$disconnect() )
    .catch ( async (e) => {
      console.error(e);
      await prisma.$disconnect();
      process.exit(1);
    })