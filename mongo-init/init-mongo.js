// MongoDB 초기화 스크립트
db = db.getSiblingDB('test');

// 상품 컬렉션 생성 (없으면)
if (!db.getCollectionNames().includes('products')) {
  db.createCollection('products');
}

// 샘플 데이터 생성 함수
function generateProductSamples() {
  const brands = ['Nike', 'Adidas', 'Puma', 'New Balance', 'Under Armour', 'FILA', 'Reebok', 'Vans', 'Converse'];
  const categories = ['운동화', '샌들', '부츠', '로퍼', '구두', '슬리퍼'];
  const colors = ['빨강', '파랑', '검정', '회색', '흰색', '녹색', '노랑', '분홍', '주황', '보라'];
  const sizes = ['220', '230', '240', '250', '260', '270', '280', '290', '300'];
  
  const products = [];
  
  for (let i = 1; i <= 1000; i++) {
    const brand = brands[Math.floor(Math.random() * brands.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    const color = colors[Math.floor(Math.random() * colors.length)];
    
    // 옵션(사이즈별 재고) 생성
    const options = [];
    let total_stock = 0;
    
    // 해당 상품에 4-6개의 사이즈 옵션 추가
    const sizeCount = Math.floor(Math.random() * 3) + 4;
    const selectedSizes = [];
    
    // 중복되지 않는 사이즈 선택
    while (selectedSizes.length < sizeCount) {
      const size = sizes[Math.floor(Math.random() * sizes.length)];
      if (!selectedSizes.includes(size)) {
        selectedSizes.push(size);
      }
    }
    
    selectedSizes.forEach(size => {
      const stock = Math.floor(Math.random() * 50) + 1;
      options.push({ size: size, stock: stock });
      total_stock += stock;
    });
    
    products.push({
      name: brand + ' ' + category + ' ' + color + ' ' + i,
      brand: brand,
      category: category,
      color: color,
      options: options,
      total_stock: total_stock,
      createdAt: new Date()
    });
  }
  
  return products;
}

// 기존 데이터 삭제 후 새 데이터 삽입
db.products.drop();
db.products.insertMany(generateProductSamples());

print('MongoDB 초기화 완료: products 컬렉션에 1000개의 상품 데이터가 추가되었습니다.');