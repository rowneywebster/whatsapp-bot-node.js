// products.js — product catalog
module.exports = {
    '1': {
        name: 'Silver Crest Blender',
        price: 'KES 5,000',
        image: 'https://bestcarteshop.com/wp-content/uploads/2025/05/Main-pic-1-768x768-removebg-preview-1.png',
        link: 'https://bestcarteshop.com/2-in-1-professional-blender/'
    },
    '2': {
        name: 'Bathroom Corner Shelf',
        price: 'KES 2,999',
        image: 'https://bestcarteshop.com/wp-content/uploads/2024/03/911AdXxUchL._SL1500_-1024x1024.jpg',
        link: 'https://bestcarteshop.com/bathroom-corner-shelf-organizer/'
    },
    '3': {
        name: 'Breakfast Maker',
        price: 'KES 6,499',
        image: 'https://bestcarteshop.com/wp-content/uploads/2024/05/71aiK1IVVAL._AC_SL1001_-700x700-1.webp',
        link: 'https://bestcarteshop.com/3-in-1-breakfast-maker/'
    },
    '4': {
        name: 'Power Bank',
        price: 'KES 2,999',
        image: 'https://bestcarteshop.com/wp-content/uploads/2024/02/999351db0d29d27cd6a97d4a50741dd9.jpeg_2200x2200q80.jpg_-768x768.webp',
        link: 'https://bestcarteshop.com/wireless-20000mah-fast-charging-power-bank/'
    }
};


// state.js — state manager
const states = {};

exports.get = user => states[user];
exports.set = (user, value) => { states[user] = value; };
exports.clear = user => { delete states[user]; };
