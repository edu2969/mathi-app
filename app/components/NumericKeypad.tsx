interface NumericKeypadProps {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onSubmit: () => void;
  disabled: boolean;
}

export default function NumericKeypad({ onDigit, onDelete, onSubmit, disabled }: NumericKeypadProps) {
  // Layout exacto del original: [1, 2, 3, 4, 5, 6, 7, 8, 9, "D", 0, "O"]
  const keys = [1, 2, 3, 4, 5, 6, 7, 8, 9, "D", 0, "O"];

  return (
    <div className="flex flex-row flex-wrap justify-center w-full h-full px-2 py-4 bg-[#222] sm:rounded-2xl shadow-inner border-black relative">
      {/* Efecto brillo superior */}
      <div className="absolute top-0 left-0 w-full h-3 bg-linear-to-b from-white/30 to-transparent rounded-t-2xl pointer-events-none" />
      {keys.map((key, index) => {
        const isDelete = key === "D";
        const isOk = key === "O";
        return (
          <button
            key={`tecla_${key}`}
            disabled={disabled}
            onClick={() => {
              if (isDelete) onDelete();
              else if (isOk) onSubmit();
              else onDigit(key.toString());
            }}
            className={`
              w-[30%] h-16 m-[1.5%] text-white text-2xl font-bold text-center
              transition-all duration-200 shadow-lg
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'}
              ${isDelete ?
                'bg-linear-to-b from-red-700 via-red-900 to-black border-b-4 border-red-900' :
                isOk ?
                  'bg-linear-to-b from-emerald-600 via-emerald-800 to-black border-b-4 border-emerald-900' :
                  'bg-linear-to-b from-black via-gray-900 to-gray-800 border-b-4 border-gray-900'
              }
              rounded-xl
              relative
              overflow-hidden
            `}
            style={{ fontFamily: 'monospace', boxShadow: '0 2px 8px #0008' }}
          >
            {/* Brillo superior botón */}
            <span className="absolute top-0 left-0 w-full h-2 bg-linear-to-b from-white/30 to-transparent rounded-t-xl pointer-events-none" />
            <span className="relative z-10">{isDelete ? '⌫' : isOk ? 'OK' : key}</span>
          </button>
        );
      })}
    </div>
  );
}
