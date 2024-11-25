const prisma = require(`../prisma`);

const express = require(`express`);
const router = express.Router();
module.exports = router

const { authenticate } = require(`./auth`);

router.get("/", authenticate, async (req, res, next) => {
  try{
    const orders = await prisma.order.findMany({ where: {customerId: req.user.id} });
    res.json(orders);
  } catch(e) {
    next(e);
  }
});

router.post("/", authenticate, async (req, res, next) => {
  const { date, note, itemIds } = req.body;

  const nextError = (field, dataType) => {
      next({
        status: 400,
        message: `Attention, ${field} (${field} : ${dataType}) required`})
  };

  if(!date) return nextError(`date`, `String`)
  if(!note) return nextError(`note`, `String`)
  if(!itemIds) return nextError(`ItemIds`, `[Int]`)

  const items = itemIds.map((id) => ({ id }));

  try {
    const order = await prisma.order.create({ 
      data: {
        date,
        note,
        customerId: req.user.id,
        items: { connect: items }
      },
    });
    res.status(201).json(order)
  } catch(e) {
    next(e);
  }
});

router.get("/:id", authenticate, async (req, res, next) =>{
  const { id } = req.params;

  
  try{
    const orders = await prisma.order.findUnique({
      where: { 
        id: +id,
        customerId: req.user.id, 
      },
      include: {items: true}
    });

    if(!orders){
      next({
        status: 403,
        message: `Access Denied. Please log in with the correct credentials.`
      })
    };

    res.json(orders);
  } catch(e) {
    next(e);
  }
});