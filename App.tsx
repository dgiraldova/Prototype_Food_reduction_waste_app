import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, Heart, Share, Search, Home, FileText, Map, User, 
  Eye, EyeOff, Image, ChevronDown, Plus, Minus, EditIcon, 
  RefreshCw, Clock, AlertCircle, Box, Hourglass, DollarSign, CreditCard, Bot
} from './components/Icons';
import { generateUXScript } from './services/geminiService';

// --- Types ---
type ScreenName = 
  | 'login' 
  | 'vendorHome' 
  | 'addProduct1' 
  | 'addProduct2' 
  | 'consumerHome' 
  | 'productDetail' 
  | 'checkout' 
  | 'payment' 
  | 'success';

interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  originalPrice: number;
  image: string;
  stock: number;
  expiryTime: string;
  shopName: string;
  shopHours: string;
}

// --- Mock Data ---
const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Yogurt Griego Natural',
    description: 'Yogurt griego natural, rico en proteínas. Ideal para el desayuno.',
    category: 'Lácteos y Huevos',
    price: 2.00,
    originalPrice: 4.50,
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=600&auto=format&fit=crop',
    stock: 8,
    expiryTime: 'Vence en 18 horas',
    shopName: 'Supermercado Central',
    shopHours: 'Hoy, 09:00 - 21:00'
  },
  {
    id: '2',
    name: 'Plátanos Orgánicos',
    description: 'Plátanos maduros perfectos para repostería o batidos.',
    category: 'Frutas y Verduras',
    price: 1.50,
    originalPrice: 3.00,
    image: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?q=80&w=600&auto=format&fit=crop',
    stock: 3,
    expiryTime: 'Vence en 1 día',
    shopName: 'Frutería Manolo',
    shopHours: 'Hoy, 08:00 - 20:00'
  },
  {
    id: '3',
    name: 'Pan de Molde Integral',
    description: 'Pan de molde 100% integral, horneado esta mañana.',
    category: 'Panadería',
    price: 1.00,
    originalPrice: 2.50,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop',
    stock: 1,
    expiryTime: 'Vence en 2 días',
    shopName: 'Panadería La Espiga',
    shopHours: 'Hoy, 07:00 - 19:00'
  },
  {
    id: '4',
    name: 'Pan Artesanal de Masa Madre',
    description: 'Hogaza recién horneada, perfecta para tostadas o sándwiches. Elaborada con ingredientes orgánicos y un proceso de fermentación lenta.',
    category: 'Panadería',
    price: 2.50,
    originalPrice: 5.00,
    image: 'https://images.unsplash.com/photo-1585476290138-0c6e94560d06?q=80&w=600&auto=format&fit=crop',
    stock: 3,
    expiryTime: '25 Oct 2024, 20:00h',
    shopName: 'Frutería Manolo',
    shopHours: 'Hoy, 18:00 - 19:00'
  }
];

const VENDOR_PRODUCTS_EXPIRING = [
  {
    id: '101',
    name: 'Croissants de Mantequilla',
    category: 'Panadería',
    image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?q=80&w=200&auto=format&fit=crop',
    status: 'Vence en 3 días',
    statusColor: 'text-amber-500'
  },
  {
    id: '102',
    name: 'Yogur Griego Natural',
    category: 'Lácteos y Huevos',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?q=80&w=200&auto=format&fit=crop',
    status: 'Vence en 5 días',
    statusColor: 'text-amber-500'
  }
];

const VENDOR_PRODUCTS_EXPIRED = [
  {
    id: '201',
    name: 'Ensalada César con Pollo',
    category: 'Comidas Preparadas',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=200&auto=format&fit=crop',
    status: 'Venció ayer',
    statusColor: 'text-red-500'
  }
];

// --- Sub-Components ---

const BottomNav = ({ active, onClick }: { active: string, onClick: (tab: string) => void }) => (
  <div className="bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center fixed bottom-0 w-full max-w-md">
    <button onClick={() => onClick('home')} className={`flex flex-col items-center ${active === 'home' ? 'text-primary-500' : 'text-gray-400'}`}>
      <Home className="w-6 h-6" />
      <span className="text-xs mt-1">Inicio</span>
    </button>
    <button onClick={() => onClick('orders')} className={`flex flex-col items-center ${active === 'orders' ? 'text-primary-500' : 'text-gray-400'}`}>
      <FileText className="w-6 h-6" />
      <span className="text-xs mt-1">Pedidos</span>
    </button>
    <button onClick={() => onClick('map')} className={`flex flex-col items-center ${active === 'map' ? 'text-primary-500' : 'text-gray-400'}`}>
      <Map className="w-6 h-6" />
      <span className="text-xs mt-1">Mapa</span>
    </button>
    <button onClick={() => onClick('profile')} className={`flex flex-col items-center ${active === 'profile' ? 'text-primary-500' : 'text-gray-400'}`}>
      <User className="w-6 h-6" />
      <span className="text-xs mt-1">Perfil</span>
    </button>
  </div>
);

const Header = ({ title, leftIcon, onLeftClick, rightIcons }: any) => (
  <div className="flex items-center justify-between px-4 py-4 bg-white sticky top-0 z-10">
    <button onClick={onLeftClick} className="p-2 -ml-2 text-gray-700">
      {leftIcon || <ChevronLeft className="w-6 h-6" />}
    </button>
    <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
    <div className="flex gap-4 text-gray-700 w-8 justify-end">
      {rightIcons}
    </div>
  </div>
);

// --- Main App Component ---

export default function App() {
  const [screen, setScreen] = useState<ScreenName>('login');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newProduct, setNewProduct] = useState({ name: '', category: '', stock: 1, price: 0, originalPrice: 0 });
  
  // AI Assistant State
  const [showAi, setShowAi] = useState(false);
  const [aiOutput, setAiOutput] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  // Helper to change screen
  const navigate = (s: ScreenName) => {
    window.scrollTo(0,0);
    setScreen(s);
  };

  const handleAiAction = async (type: 'script' | 'analyze') => {
    setLoadingAi(true);
    setAiOutput('');
    
    // Construct context based on current screen
    let context = `Current Screen: ${screen}. `;
    if (screen === 'login') context += "Vendor login screen. Inputs for email and password.";
    if (screen === 'consumerHome') context += "Consumer home feed showing nearby discounted food items expiring soon.";
    if (screen === 'productDetail') context += `Product detail for ${selectedProduct?.name}. Shows image, price ${selectedProduct?.price}, original ${selectedProduct?.originalPrice}, expiry ${selectedProduct?.expiryTime}. Action: Reserve.`;
    if (screen === 'checkout') context += "Checkout screen. User inputs personal details (Name, Email, Phone).";
    if (screen === 'payment') context += "Payment method selection (Card, PayPal, GPay) and card details.";
    if (screen === 'vendorHome') context += "Vendor dashboard showing products expiring soon and expired items. Actions: Edit, Refresh, Add New.";
    if (screen === 'addProduct1') context += "Add Product Step 1: Image upload, Name, Category.";
    if (screen === 'addProduct2') context += "Add Product Step 2: Stock quantity, Expiry date, Price setting.";

    try {
      if (type === 'script') {
        const script = await generateUXScript(context);
        setAiOutput(script);
      } else {
        const script = await generateUXScript(context + " Instead of a script, please analyze this screen for usability issues (Heuristic Evaluation) and suggest 3 improvements.");
        setAiOutput(script);
      }
    } catch (e) {
      setAiOutput("Error generating AI response.");
    } finally {
      setLoadingAi(false);
    }
  };

  // --- Screens ---

  const LoginScreen = () => (
    <div className="bg-gray-50 min-h-screen px-6 py-10 flex flex-col justify-center">
      <div className="mb-8">
        <button className="mb-6" onClick={() => navigate('consumerHome')}>
            <ChevronLeft className="w-6 h-6 text-gray-800" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Bienvenido Vendedor!</h1>
        <p className="text-green-600 text-sm">Inicia sesión para gestionar tus productos.</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Correo electrónico o usuario</label>
          <div className="bg-primary-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-primary-500 transition-colors">
             <input type="text" placeholder="tu@email.com" className="bg-transparent w-full outline-none text-gray-700 placeholder-gray-400" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-900 mb-2">Contraseña</label>
          <div className="bg-primary-50 rounded-xl px-4 py-3 border border-transparent focus-within:border-primary-500 transition-colors flex items-center">
             <input type="password" value="password" readOnly className="bg-transparent w-full outline-none text-gray-700" />
             <EyeOff className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex justify-end mt-2">
            <button className="text-sm text-primary-500">¿Olvidé mi Contraseña?</button>
          </div>
        </div>

        <button 
          onClick={() => navigate('vendorHome')}
          className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-500/30 transition-all active:scale-95"
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );

  const VendorHomeScreen = () => (
    <div className="bg-gray-50 min-h-screen pb-20">
      <Header title="Alertas de Vencimiento" leftIcon={<ChevronLeft />} onLeftClick={() => navigate('login')} />
      
      <div className="px-4 py-4 space-y-8">
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Vence Pronto (2)</h2>
          <div className="space-y-4">
            {VENDOR_PRODUCTS_EXPIRING.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-green-500 mb-2">{p.category}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <div className={`bg-amber-50 px-3 py-1 rounded-full flex items-center gap-1 ${p.statusColor}`}>
                     <Hourglass className="w-3 h-3" />
                     <span className="text-xs font-medium">{p.status}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100"><EditIcon className="w-4 h-4" /></button>
                    <button className="p-2 bg-green-50 rounded-full text-green-600 hover:bg-green-100"><RefreshCw className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-4">Vencido (1)</h2>
          <div className="space-y-4">
            {VENDOR_PRODUCTS_EXPIRED.map(p => (
              <div key={p.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex gap-4 items-center">
                <img src={p.image} alt={p.name} className="w-16 h-16 rounded-xl object-cover grayscale" />
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-green-500 mb-2">{p.category}</p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                   <div className="bg-red-50 text-red-500 px-3 py-1 rounded-full flex items-center gap-1">
                     <AlertCircle className="w-3 h-3" />
                     <span className="text-xs font-medium">{p.status}</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    <button className="p-2 bg-gray-50 rounded-full text-gray-600 hover:bg-gray-100"><EditIcon className="w-4 h-4" /></button>
                    <button className="p-2 bg-green-50 rounded-full text-green-600 hover:bg-green-100"><RefreshCw className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-6 right-6">
        <button 
          onClick={() => navigate('addProduct1')}
          className="bg-primary-500 hover:bg-primary-600 text-white p-4 rounded-full shadow-lg shadow-primary-500/40 transition-transform active:scale-90"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  );

  const AddProductScreen1 = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col">
      <div className="bg-white p-4 flex justify-between items-center">
        <button onClick={() => navigate('vendorHome')}><ChevronLeft className="w-6 h-6 text-gray-800" /></button>
        <h1 className="font-semibold text-lg">Nuevo Producto</h1>
        <div className="w-6"></div>
      </div>
      
      <div className="flex-1 p-6">
        <div className="mb-6">
          <p className="text-sm font-medium text-gray-900 mb-2">Paso 1 de 2</p>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-primary-500 rounded-full"></div>
          </div>
          <p className="text-xs text-green-600 mt-2">Información Básica</p>
        </div>

        <div className="border-2 border-dashed border-primary-200 bg-primary-50/50 rounded-3xl p-8 flex flex-col items-center justify-center mb-8 h-64">
          <div className="bg-primary-100 p-4 rounded-full mb-4">
             <Image className="w-8 h-8 text-primary-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-center mb-1">Subir Imagen del Producto</h3>
          <p className="text-green-600 text-sm">Toca para añadir una foto</p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Nombre del Producto</label>
            <input 
              type="text" 
              placeholder="Ej: Pan de masa madre fresco"
              className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 outline-none focus:border-primary-500 transition-colors"
              value={newProduct.name}
              onChange={(e) => setNewProduct({...newProduct, name: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Categoría</label>
            <div className="relative">
              <select 
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 outline-none appearance-none focus:border-primary-500 transition-colors text-gray-700"
                value={newProduct.category}
                onChange={(e) => setNewProduct({...newProduct, category: e.target.value})}
              >
                <option>Selecciona una categoría</option>
                <option>Panadería</option>
                <option>Frutas</option>
              </select>
              <ChevronDown className="absolute right-4 top-3.5 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <button 
          onClick={() => navigate('addProduct2')}
          className="w-full bg-primary-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
        >
          Siguiente
        </button>
      </div>
    </div>
  );

  const AddProductScreen2 = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col">
       <div className="bg-white p-4 flex justify-between items-center">
        <button onClick={() => navigate('addProduct1')}><ChevronLeft className="w-6 h-6 text-gray-800" /></button>
        <h1 className="font-semibold text-lg">Crear Producto (2/2)</h1>
        <div className="w-6"></div>
      </div>

      <div className="flex-1 p-6">
        <div className="flex justify-center mb-8 gap-2">
            <div className="h-1.5 w-8 bg-gray-300 rounded-full"></div>
            <div className="h-1.5 w-8 bg-primary-500 rounded-full"></div>
        </div>

        <div className="space-y-8">
            {/* Quantity */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Cantidad</label>
                <div className="bg-white p-4 rounded-xl flex justify-between items-center shadow-sm">
                    <span className="text-gray-700">Unidades disponibles</span>
                    <div className="flex items-center gap-4">
                        <button className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200" onClick={() => setNewProduct(p => ({...p, stock: Math.max(0, p.stock - 1)}))}>
                            <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-semibold text-lg w-4 text-center">{newProduct.stock}</span>
                         <button className="w-8 h-8 rounded-full bg-green-100 text-green-600 flex items-center justify-center hover:bg-green-200" onClick={() => setNewProduct(p => ({...p, stock: p.stock + 1}))}>
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Expiry */}
             <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Fecha de Vencimiento</label>
                <div className="bg-white p-4 rounded-xl shadow-sm">
                     <input type="text" placeholder="Seleccionar fecha" className="w-full outline-none text-gray-700" />
                </div>
            </div>

            {/* Price */}
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-3">Precio</label>
                <div className="flex gap-4">
                    <div className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                        <span className="text-xs text-gray-500 block mb-1">Precio sin descuento</span>
                        <div className="flex items-center text-gray-300">
                            <DollarSign className="w-4 h-4" />
                            <input type="number" placeholder="0.00" className="w-full outline-none text-xl font-bold text-gray-300 placeholder-gray-300 strike" />
                        </div>
                    </div>
                    <div className="flex-1 bg-white p-4 rounded-xl shadow-sm">
                         <span className="text-xs text-gray-500 block mb-1">Precio</span>
                        <div className="flex items-center text-gray-900">
                            <DollarSign className="w-4 h-4" />
                            <input type="number" placeholder="0.00" className="w-full outline-none text-xl font-bold text-gray-900 placeholder-gray-300" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <div className="p-6 bg-white border-t border-gray-100">
        <button 
          onClick={() => navigate('vendorHome')}
          className="w-full bg-primary-500 text-white font-semibold py-4 rounded-xl shadow-lg shadow-primary-500/20 active:scale-95 transition-all"
        >
          Publicar Producto
        </button>
      </div>
    </div>
  );

  const ConsumerHomeScreen = () => (
    <div className="bg-gray-50 min-h-screen pb-24">
      <div className="px-6 pt-12 pb-6 flex justify-between items-center bg-white sticky top-0 z-10 shadow-sm">
        <Search className="w-6 h-6 text-gray-800" />
        <h1 className="text-lg font-bold">Cerca de ti</h1>
        <button onClick={() => navigate('login')}><User className="w-6 h-6 text-gray-800" /></button>
      </div>

      <div className="px-6 py-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Expira pronto</h2>
        <div className="space-y-6">
            {MOCK_PRODUCTS.map(product => (
                <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => { setSelectedProduct(product); navigate('productDetail'); }}>
                    <div className="h-48 overflow-hidden relative">
                        <img src={product.image} className="w-full h-full object-cover" alt={product.name} />
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/20 to-transparent"></div>
                    </div>
                    <div className="p-5">
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="text-xl font-bold text-gray-900 leading-tight w-2/3">{product.name}</h3>
                             <span className="bg-orange-100 text-orange-700 text-xs px-3 py-1 rounded-full font-medium whitespace-nowrap">{product.expiryTime}</span>
                        </div>
                        <p className="text-green-600 text-sm mb-4">{product.stock} {product.stock === 1 ? 'unidad' : product.category === 'Frutas y Verduras' ? 'manojos disponibles' : 'unidades'}</p>
                        <div className="flex justify-between items-end">
                            <div className="flex items-baseline gap-2">
                                <span className="text-xl font-bold text-gray-900">€{product.price.toFixed(2)}</span>
                                <span className="text-gray-400 line-through text-sm">€{product.originalPrice.toFixed(2)}</span>
                            </div>
                            <button className="bg-primary-500 text-white px-4 py-2 rounded-lg font-medium text-sm shadow-md shadow-primary-500/20">
                                Ver detalle
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>
      <BottomNav active="home" onClick={(t) => {}} />
    </div>
  );

  const ProductDetailScreen = () => {
    if (!selectedProduct) return null;
    return (
        <div className="bg-gray-50 min-h-screen pb-24 relative">
             {/* Header Overlay */}
            <div className="absolute top-0 left-0 w-full p-4 flex justify-between items-center z-20 text-white">
                 <button onClick={() => navigate('consumerHome')} className="p-2 bg-black/20 backdrop-blur-md rounded-full"><ChevronLeft className="w-6 h-6" /></button>
                 <div className="flex gap-3">
                     <button className="p-2 bg-black/20 backdrop-blur-md rounded-full"><Heart className="w-6 h-6" /></button>
                     <button className="p-2 bg-black/20 backdrop-blur-md rounded-full"><Share className="w-6 h-6" /></button>
                 </div>
            </div>

            {/* Image */}
            <div className="h-80 w-full relative">
                 <img src={selectedProduct.image} className="w-full h-full object-cover" alt={selectedProduct.name} />
                 <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-gray-900/60 to-transparent"></div>
            </div>

            {/* Content */}
            <div className="bg-gray-50 px-6 py-8 -mt-6 rounded-t-3xl relative z-10">
                <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{selectedProduct.name}</h1>
                
                <p className="text-gray-600 leading-relaxed mb-8">
                    {selectedProduct.description}
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                             <Box className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Cantidad Disponible</p>
                            <p className="font-bold text-gray-900">Quedan {selectedProduct.stock} unidades</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                             <Hourglass className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-xs text-gray-500">Vence</p>
                            <p className="font-bold text-gray-900">{selectedProduct.expiryTime}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="fixed bottom-0 w-full max-w-md bg-white border-t border-gray-100 p-6 pb-8 flex items-center justify-between z-30">
                <div>
                     <p className="text-xs text-gray-500 mb-1">Precio</p>
                     <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-bold text-gray-900">${selectedProduct.price.toFixed(2)}</span>
                        <span className="text-gray-400 line-through text-lg">${selectedProduct.originalPrice.toFixed(2)}</span>
                     </div>
                </div>
                <button 
                  onClick={() => navigate('checkout')}
                  className="bg-primary-500 text-white px-10 py-4 rounded-xl font-bold text-lg shadow-xl shadow-primary-500/30 hover:bg-primary-600 transition-colors"
                >
                    Reservar
                </button>
            </div>
        </div>
    );
  };

  const CheckoutScreen = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col">
       <Header title="Confirmar Reserva" leftIcon={<ChevronLeft />} onLeftClick={() => navigate('productDetail')} />
       
       <div className="flex px-4 mt-2 mb-6">
           <div className="flex-1 border-b-4 border-primary-500 pb-2 text-center text-sm font-semibold text-gray-900">Datos</div>
           <div className="flex-1 border-b-4 border-gray-200 pb-2 text-center text-sm font-medium text-gray-400">Pago</div>
       </div>

       <div className="flex-1 px-4 overflow-y-auto pb-24 no-scrollbar">
           <h2 className="font-bold text-lg mb-4">Tus Datos</h2>
           
           <div className="space-y-4 mb-8">
               <div>
                   <label className="block text-sm text-gray-600 mb-1">Nombre Completo</label>
                   <input type="text" className="w-full bg-white border border-gray-200 rounded-lg p-3 text-gray-900 outline-none focus:border-primary-500" defaultValue="Ana Torres" />
               </div>
               <div>
                   <label className="block text-sm text-gray-600 mb-1">Correo Electrónico</label>
                   <input type="email" className="w-full bg-white border border-gray-200 rounded-lg p-3 text-gray-900 outline-none focus:border-primary-500" defaultValue="ana.torres@email.com" />
               </div>
               <div>
                   <label className="block text-sm text-gray-600 mb-1">Número de Teléfono</label>
                   <input type="tel" className="w-full bg-white border border-gray-200 rounded-lg p-3 text-gray-900 outline-none focus:border-primary-500" placeholder="+34 600 000 000" />
               </div>
           </div>

           <h2 className="font-bold text-lg mb-4">Resumen del Pedido</h2>
           <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
               <div className="flex justify-between border-b border-gray-100 pb-3 mb-3">
                   <span className="text-gray-700">{selectedProduct?.name || 'Cesta sorpresa'}</span>
                   <span className="font-bold">{(selectedProduct?.price || 4.99).toFixed(2)}€</span>
               </div>
               <div>
                   <p className="text-xs text-gray-500">Recogida</p>
                   <p className="font-bold text-sm">{selectedProduct?.shopName || 'Frutería Manolo'}</p>
                   <p className="text-xs text-gray-500">{selectedProduct?.shopHours || 'Hoy, 18:00 - 19:00'}</p>
               </div>
           </div>
       </div>

       <div className="p-4 bg-white border-t border-gray-100">
           <button onClick={() => navigate('payment')} className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20">
               Continuar al Pago
           </button>
       </div>
    </div>
  );

  const PaymentScreen = () => (
    <div className="bg-gray-50 min-h-screen flex flex-col">
       <Header title="Pago" leftIcon={<ChevronLeft />} onLeftClick={() => navigate('checkout')} />
       
       <div className="flex px-4 mt-2 mb-6">
           <div className="flex-1 border-b-4 border-primary-200 pb-2 text-center text-sm font-medium text-gray-400">Datos</div>
           <div className="flex-1 border-b-4 border-primary-500 pb-2 text-center text-sm font-semibold text-gray-900">Pago</div>
       </div>

       <div className="flex-1 px-4 overflow-y-auto pb-24 no-scrollbar">
           <h2 className="font-bold text-lg mb-4">Seleccionar Método de Pago</h2>
           
           <div className="space-y-3 mb-8">
               <div className="bg-green-100 border-2 border-primary-500 rounded-xl p-4 flex items-center gap-3">
                   <div className="w-5 h-5 rounded-full border-4 border-primary-500 bg-white"></div>
                   <CreditCard className="w-6 h-6 text-gray-800" />
                   <span className="font-medium text-gray-900">Tarjeta de crédito o débito</span>
               </div>
               <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                   <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                   <span className="italic font-bold text-blue-800 text-lg">PayPal</span>
                   <span className="ml-2 text-gray-900">PayPal</span>
               </div>
               <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                   <div className="flex items-center gap-1">
                       <span className="font-medium text-gray-500">Google</span>
                       <span className="font-medium text-gray-900">Pay</span>
                   </div>
               </div>
           </div>

           <h2 className="font-bold text-lg mb-4">Número de Tarjeta</h2>
           <div className="space-y-4 mb-8">
                <input type="text" placeholder="0000 0000 0000 0000" className="w-full bg-white border border-gray-200 rounded-lg p-4 text-gray-900 outline-none focus:border-primary-500 tracking-wider" />
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1 ml-1">Vencimiento</label>
                        <input type="text" placeholder="MM/AA" className="w-full bg-white border border-gray-200 rounded-lg p-4 text-gray-900 outline-none focus:border-primary-500" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1 ml-1">CVC</label>
                        <input type="text" placeholder="123" className="w-full bg-white border border-gray-200 rounded-lg p-4 text-gray-900 outline-none focus:border-primary-500" />
                    </div>
                </div>
           </div>
           
           <h2 className="font-bold text-lg mb-4">Resumen del Pedido</h2>
           <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
               <div className="flex justify-between border-b border-gray-100 pb-3 mb-3">
                   <span className="text-gray-700">{selectedProduct?.name || 'Cesta sorpresa'}</span>
                   <span className="font-bold">{(selectedProduct?.price || 4.99).toFixed(2)}€</span>
               </div>
               <div>
                   <p className="text-xs text-gray-500">Recogida</p>
                   <p className="font-bold text-sm">{selectedProduct?.shopName || 'Frutería Manolo'}</p>
                   <p className="text-xs text-gray-500">{selectedProduct?.shopHours || 'Hoy, 18:00 - 19:00'}</p>
               </div>
           </div>
       </div>

       <div className="p-4 bg-white border-t border-gray-100">
           <button onClick={() => navigate('consumerHome')} className="w-full bg-primary-500 text-white font-bold py-4 rounded-xl hover:bg-primary-600 shadow-lg shadow-primary-500/20">
               Confirmar Pago
           </button>
       </div>
    </div>
  );

  return (
    <div className="w-full h-full relative">
      {screen === 'login' && <LoginScreen />}
      {screen === 'vendorHome' && <VendorHomeScreen />}
      {screen === 'addProduct1' && <AddProductScreen1 />}
      {screen === 'addProduct2' && <AddProductScreen2 />}
      {screen === 'consumerHome' && <ConsumerHomeScreen />}
      {screen === 'productDetail' && <ProductDetailScreen />}
      {screen === 'checkout' && <CheckoutScreen />}
      {screen === 'payment' && <PaymentScreen />}

      {/* AI Assistant FAB */}
      <button 
        onClick={() => setShowAi(true)}
        className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white p-3 rounded-full shadow-2xl hover:bg-gray-800 transition-all hover:scale-105"
        title="AI Assistant"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* AI Assistant Modal */}
      {showAi && (
        <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div className="flex items-center gap-2">
                 <Bot className="w-5 h-5 text-primary-500" />
                 <h3 className="font-bold text-gray-900">UX Testing Assistant</h3>
              </div>
              <button onClick={() => setShowAi(false)} className="p-2 hover:bg-gray-200 rounded-full text-gray-500">✕</button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              {loadingAi ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                   <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                   <p className="text-sm text-gray-500 animate-pulse">Consulting Gemini...</p>
                </div>
              ) : aiOutput ? (
                <div className="prose prose-sm prose-green">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{aiOutput}</pre>
                </div>
              ) : (
                <div className="text-center space-y-4">
                   <p className="text-gray-600 text-sm">Select an action for the current screen <strong>({screen})</strong>:</p>
                   <button 
                     onClick={() => handleAiAction('script')}
                     className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 font-medium transition-colors flex items-center justify-center gap-2"
                   >
                     <FileText className="w-4 h-4" /> Generate Test Script
                   </button>
                   <button 
                     onClick={() => handleAiAction('analyze')}
                     className="w-full py-3 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-800 font-medium transition-colors flex items-center justify-center gap-2"
                   >
                     <Eye className="w-4 h-4" /> Analyze Usability
                   </button>
                </div>
              )}
            </div>
            {aiOutput && (
                <div className="p-4 border-t border-gray-100 bg-gray-50">
                    <button onClick={() => setAiOutput('')} className="w-full py-3 text-sm font-semibold text-gray-600 hover:text-gray-900">Start Over</button>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
