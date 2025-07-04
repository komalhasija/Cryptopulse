// components/CryptoCard.jsx
export default function CryptoCard({ icon, name, price, change, label }) {
  const isUp = parseFloat(change) >= 0;

  return (
    <div className="bg-[#1E213A] p-4 rounded-xl flex justify-between items-center shadow">
      <div className="flex items-center gap-4">
        <img src={icon} alt={name} className="w-8 h-8" />
        <div>
          <h2 className="text-white text-lg font-semibold">{name}</h2>
          <p className="text-gray-400 text-sm">{label}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="text-white text-lg font-semibold">${price}</p>
        <p className={`text-sm ${isUp ? "text-green-400" : "text-red-400"}`}>
          {isUp ? "+" : ""}
          {change}%
        </p>
      </div>
    </div>
  );
}