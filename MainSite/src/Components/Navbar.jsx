import React, { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { ShopContext } from '../Components/ShopContext/ShopContext';

const Navbar = ({ pageTitles }) => {
  const { shop, setShop } = useContext(ShopContext);

  const handleShopChange = (e) => {
    setShop(e.target.value);
  };

  const location = useLocation();

  const getPageTitle = (pathname) => {
    return pageTitles[pathname] || 'BusinessPro'; // Fallback title
  };

  return (
    <div className="header">
      <h1 className='h1-base'>{getPageTitle(location.pathname)}</h1>
      <div className="user-info">
        <div className="shop-selector">
          <label>Shop: </label>
          <select value={shop} onChange={handleShopChange}>
            <option value="Shop 1">Shop 1</option>
            <option value="Shop 2">Shop 2</option>
          </select>
        </div>
        <div className="user">
          <span className="user-name">Anantha Lakshmi</span>
          <span className="user-role">Admin</span>
        </div>
        <div className="user-avatar">
          <img src="https://www.pngmart.com/files/21/Admin-Profile-Vector-PNG-Clipart.png" alt="User avatar" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;