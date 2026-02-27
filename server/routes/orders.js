const router = require('express').Router();
const Order = require('../models/Order');
const User = require('../models/User');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { cacheMiddleware, invalidateCache } = require('../middleware/cache');

// POST /api/orders — create order from current cart
router.post('/', requireAuth, invalidateCache('/api/orders', '/api/cart'), async (req, res) => {
  try {
    const { items, total, totalItems } = req.body;
    const user = req.user;

    const order = await Order.create({
      userId: user._id,
      username: user.username,
      items,
      total,
      totalItems,
      status: 'paid',
    });

    // clear cart after order
    user.cart = [];
    await user.save();

    res.status(201).json(order);
  } catch (err) {
    console.error('create order error:', err);
    res.status(500).json({ error: 'Ошибка создания заказа' });
  }
});

// GET /api/orders — get my orders (cached 30s + ETag)
router.get('/', requireAuth, cacheMiddleware(30), async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки заказов' });
  }
});

// GET /api/orders/all — admin: get all orders (cached 30s + ETag)
router.get('/all', requireAuth, requireAdmin, cacheMiddleware(30), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка загрузки заказов' });
  }
});

// PUT /api/orders/:id/status — admin: update order status
router.put('/:id/status', requireAuth, requireAdmin, invalidateCache('/api/orders'), async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Заказ не найден' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: 'Ошибка обновления заказа' });
  }
});

module.exports = router;
