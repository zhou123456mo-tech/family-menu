import 'dotenv/config'
import { PrismaClient } from '../src/generated/prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // 创建分类
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { id: 'cat-hot' },
      update: {},
      create: { id: 'cat-hot', name: '热菜', icon: '🔥', sort: 1 }
    }),
    prisma.category.upsert({
      where: { id: 'cat-cold' },
      update: {},
      create: { id: 'cat-cold', name: '凉菜', icon: '🥗', sort: 2 }
    }),
    prisma.category.upsert({
      where: { id: 'cat-soup' },
      update: {},
      create: { id: 'cat-soup', name: '汤品', icon: '🍲', sort: 3 }
    }),
    prisma.category.upsert({
      where: { id: 'cat-staple' },
      update: {},
      create: { id: 'cat-staple', name: '主食', icon: '🍚', sort: 4 }
    }),
    prisma.category.upsert({
      where: { id: 'cat-drink' },
      update: {},
      create: { id: 'cat-drink', name: '饮品', icon: '🥤', sort: 5 }
    })
  ])

  console.log('Created categories:', categories.length)

  // 创建默认管理员用户
  const defaultAdminPassword = await bcrypt.hash('13253296242', 10)
  const admin = await prisma.user.upsert({
    where: { phone: '13253296242' },
    update: {},
    create: {
      name: 'admin',
      phone: '13253296242',
      password: defaultAdminPassword,
      role: 'ADMIN'
    }
  })
  console.log('Created default admin user:', admin.name, 'phone:', admin.phone)

  // 创建测试菜品
  const dishes = await Promise.all([
    prisma.dish.upsert({
      where: { id: 'dish-1' },
      update: {},
      create: {
        id: 'dish-1',
        name: '红烧肉',
        description: '肥而不腻，入口即化，经典家常菜',
        price: 38,
        image: '/images/dishes/hongshaorou.jpg',
        categoryId: 'cat-hot',
        status: 'AVAILABLE'
      }
    }),
    prisma.dish.upsert({
      where: { id: 'dish-2' },
      update: {},
      create: {
        id: 'dish-2',
        name: '清蒸鲈鱼',
        description: '鲜嫩可口，原汁原味',
        price: 58,
        image: '/images/dishes/luyu.jpg',
        categoryId: 'cat-hot',
        status: 'AVAILABLE'
      }
    }),
    prisma.dish.upsert({
      where: { id: 'dish-3' },
      update: {},
      create: {
        id: 'dish-3',
        name: '凉拌黄瓜',
        description: '清爽开胃，夏日必备',
        price: 12,
        image: '/images/dishes/huanggua.jpg',
        categoryId: 'cat-cold',
        status: 'AVAILABLE'
      }
    }),
    prisma.dish.upsert({
      where: { id: 'dish-4' },
      update: {},
      create: {
        id: 'dish-4',
        name: '番茄蛋汤',
        description: '酸甜可口，营养丰富',
        price: 18,
        image: '/images/dishes/fanqiedantang.jpg',
        categoryId: 'cat-soup',
        status: 'AVAILABLE'
      }
    }),
    prisma.dish.upsert({
      where: { id: 'dish-5' },
      update: {},
      create: {
        id: 'dish-5',
        name: '蛋炒饭',
        description: '粒粒分明，香气扑鼻',
        price: 15,
        image: '/images/dishes/danchaofan.jpg',
        categoryId: 'cat-staple',
        status: 'AVAILABLE'
      }
    })
  ])

  console.log('Created dishes:', dishes.length)

  // 为菜品创建做法
  const methods = await Promise.all([
    prisma.dishMethod.upsert({
      where: { id: 'method-1' },
      update: {},
      create: {
        id: 'method-1',
        name: '少盐',
        price: 0,
        dishId: 'dish-1'
      }
    }),
    prisma.dishMethod.upsert({
      where: { id: 'method-2' },
      update: {},
      create: {
        id: 'method-2',
        name: '多辣',
        price: 0,
        dishId: 'dish-1'
      }
    }),
    prisma.dishMethod.upsert({
      where: { id: 'method-3' },
      update: {},
      create: {
        id: 'method-3',
        name: '加蛋 +¥3',
        price: 3,
        dishId: 'dish-5'
      }
    })
  ])

  console.log('Created methods:', methods.length)

  // 创建二维码
  const qrcode = await prisma.qRCode.upsert({
    where: { id: 'qr-1' },
    update: {},
    create: {
      id: 'qr-1',
      name: '大厅入口',
      url: 'http://localhost:3000/menu',
      tableNo: null
    }
  })

  console.log('Created qrcode:', qrcode.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
