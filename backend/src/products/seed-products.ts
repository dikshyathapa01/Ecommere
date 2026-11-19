import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import AppDataSource from '../../typeorm.config';
import { Product } from './entities/product.entity';

const imageDirectory = path.resolve(
  __dirname,
  '../../../frontend/public/images',
);
const supportedExtensions = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);

async function seedProducts() {
  await AppDataSource.initialize();
  try {
    const repository = AppDataSource.getRepository(Product);
    const files = (await fs.readdir(imageDirectory))
      .filter((file) =>
        supportedExtensions.has(path.extname(file).toLowerCase()),
      )
      .sort();

    let created = 0;
    for (const file of files) {
      const imagePath = `/images/${file}`;
      const existingProducts = await repository.find();
      if (
        existingProducts.some((product) =>
          product.imageIds?.includes(imagePath),
        )
      )
        continue;

      const name = titleFromFilename(file);
      const category = categoryFromFilename(file);
      await repository.save(
        repository.create({
          name,
          price: 0,
          description: `${name} available in the ${category} section.`,
          brand: 'ShopNepal',
          category,
          imageIds: [imagePath],
          variant: [{ color: 'Default', size: 'One Size', stock: 1 }],
        }),
      );
      created++;
    }

    console.log(
      `Product seed complete: ${created} product(s) created from ${files.length} image(s).`,
    );
  } finally {
    await AppDataSource.destroy();
  }
}

function titleFromFilename(file: string) {
  return (
    path
      .basename(file, path.extname(file))
      .replace(/[-_]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, (letter) => letter.toUpperCase()) || 'New Product'
  );
}

function categoryFromFilename(
  file: string,
): 'electronics' | 'phones' | 'speakers' {
  const name = file.toLowerCase();
  if (/(phone|mobile|iphone|samsung|pixel|xiaomi)/.test(name)) return 'phones';
  if (/(speaker|audio|sound|woofer)/.test(name)) return 'speakers';
  return 'electronics';
}

seedProducts().catch((error: unknown) => {
  console.error('Product seed failed:', error);
  process.exitCode = 1;
});
