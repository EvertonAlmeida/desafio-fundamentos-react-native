import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    AsyncStorage.clear();
    async function loadProducts(): Promise<void> {
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsStorage) {
        setProducts(JSON.parse(productsStorage));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      const productExists = products.find(item => item.id === product.id);
      if (productExists) {
        setProducts(
          products.map(productCart =>
            productCart.id === product.id
              ? { ...productCart, quantity: productCart.quantity + 1 }
              : productCart,
          ),
        );
      } else {
        setProducts([...products, { ...product, quantity: 1 }]);
      }
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      setProducts(
        products.map(productCart =>
          productCart.id === id
            ? { ...productCart, quantity: productCart.quantity + 1 }
            : productCart,
        ),
      );

      await AsyncStorage.setItem(
        '@gostackmarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const productExists = products.find(item => item.id === id);
      if (productExists && productExists.quantity <= 0) {
        setProducts(productCart => productCart.filter(item => item.id !== id));
        await AsyncStorage.removeItem(productExists.id);
        return;
      }

      setProducts(
        products.map(productCart =>
          productCart.id === id
            ? { ...productCart, quantity: productCart.quantity - 1 }
            : productCart,
        ),
      );

      AsyncStorage.setItem(
        '@gostackmarketplace:products',
        JSON.stringify(products),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
