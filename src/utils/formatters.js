import { CURRENCY_SYMBOL } from '../config/constants';

export const formatCurrency = (value) => {
  if (value === undefined || value === null) return `${CURRENCY_SYMBOL}0`;
  return `${CURRENCY_SYMBOL}${Number(value).toLocaleString('en-IN')}`;
};

export const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[d.getMonth()];
  const year = d.getFullYear();
  
  return `${day} ${month} ${year}`;
};
