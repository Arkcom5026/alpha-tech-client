const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ✅ GET: ดึงสินค้าทั้งหมด
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      include: {
        template: true,
        category: true,
      },
      orderBy: { id: 'asc' },
    });
    res.json(products);
  } catch (err) {
    console.error('❌ [getAllProducts]', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสินค้าได้' });
  }
});

// ✅ GET: ดึงสินค้าจากชื่อ (สำหรับใช้งานเสริม)
router.get('/search/by-name', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) return res.status(400).json({ error: 'ต้องระบุคำค้นหาขั้นต่ำ 2 ตัวอักษร' });

    const products = await prisma.product.findMany({
      where: {
        title: {
          contains: q,
          mode: 'insensitive',
        },
      },
      include: {
        template: true,
        category: true,
      },
      orderBy: { title: 'asc' },
    });
    res.json(products);
  } catch (err) {
    console.error('❌ [searchProductByName]', err);
    res.status(500).json({ error: 'ค้นหาสินค้าโดยชื่อไม่สำเร็จ' });
  }
});

// ✅ GET: ดึงสินค้าโดย ID
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: {
        template: true,
        category: true,
      },
    });
    if (!product) return res.status(404).json({ error: 'ไม่พบสินค้า' });
    res.json(product);
  } catch (err) {
    console.error('❌ [getProductById]', err);
    res.status(500).json({ error: 'ไม่สามารถดึงข้อมูลสินค้าได้' });
  }
});

// ✅ POST: เพิ่มสินค้าใหม่
router.post('/', async (req, res) => {
  try {
    const { title, categoryId, templateId, sellPrice } = req.body;
    const product = await prisma.product.create({
      data: {
        title,
        categoryId,
        templateId,
        sellPrice,
      },
    });
    res.status(201).json(product);
  } catch (err) {
    console.error('❌ [createProduct]', err);
    res.status(500).json({ error: 'ไม่สามารถเพิ่มสินค้าได้' });
  }
});

// ✅ PUT: แก้ไขสินค้า
router.put('/:id', async (req, res) => {
  try {
    const { title, categoryId, templateId, sellPrice } = req.body;
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: {
        title,
        categoryId,
        templateId,
        sellPrice,
      },
    });
    res.json(product);
  } catch (err) {
    console.error('❌ [updateProduct]', err);
    res.status(500).json({ error: 'ไม่สามารถแก้ไขสินค้าได้' });
  }
});

// ✅ DELETE: ลบสินค้า
router.delete('/:id', async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ message: 'ลบสินค้าแล้ว' });
  } catch (err) {
    console.error('❌ [deleteProduct]', err);
    res.status(500).json({ error: 'ไม่สามารถลบสินค้าได้' });
  }
});

module.exports = router;
