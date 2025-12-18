export default function DraggableProgressBar({ value, max = 100, onChange, label, icon, itemKey, isCheckbox = false }) {
  const safeValue = Number(value) || 0;
  const safeMax = Number(max) || 100;
  const percentage = Math.min(Math.max((safeValue / safeMax) * 100, 0), 100);
  
  // Se for checkbox, tratar como boolean
  if (isCheckbox) {
    const isChecked = safeValue >= safeMax;
    const handleToggle = () => {
      onChange(isChecked ? 0 : safeMax);
    };
    
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {icon && <span className="text-xl">{icon}</span>}
            <span className="font-medium">{label}</span>
          </div>
          <input
            type="checkbox"
            checked={isChecked}
            onChange={handleToggle}
            className="w-5 h-5 rounded border-2 cursor-pointer"
            style={{
              accentColor: '#4f6d7a',
              borderColor: isChecked ? '#4f6d7a' : '#c0d6df'
            }}
          />
        </div>
      </div>
    );
  }
  const colors = {
    primary: '#4f6d7a',
    secondary: '#dd6e42',
    accent: '#c0d6df',
    background: '#eaeaea'
  };

  // Calcular pontos de parada baseado no max
  const getSnapPoints = () => {
    const points = [0]; // Sempre pode voltar para 0
    
    // Para água, incrementos de 100ml
    if (itemKey === 'agua') {
      for (let i = 100; i <= safeMax; i += 100) {
        points.push(i);
      }
      return points;
    }
    
    if (safeMax === 1) {
      return [0, 1];
    } else if (safeMax === 2) {
      return [0, 1, 2]; // 50% e 100%
    } else if (safeMax === 3) {
      return [0, 1, 2, 3]; // 33%, 66%, 100%
    } else {
      // Para valores maiores, criar pontos proporcionais
      for (let i = 1; i <= safeMax; i++) {
        points.push(i);
      }
    }
    return points;
  };

  const snapPoints = getSnapPoints();

  // Encontrar o ponto de parada mais próximo (sempre para cima, nunca para baixo)
  const snapToNearestPoint = (val) => {
    if (val <= 0) return 0;
    // Encontrar o menor ponto de parada que é >= val
    for (const point of snapPoints) {
      if (val <= point) {
        return point;
      }
    }
    // Se passou de todos, retornar o máximo
    return safeMax;
  };

  const handleMouseDown = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let newValue = Math.max(0, Math.min(safeMax, (x / rect.width) * safeMax));
    newValue = snapToNearestPoint(newValue);
    onChange(newValue);
    
    const handleMouseMove = (moveEvent) => {
      const newX = moveEvent.clientX - rect.left;
      let newValue = Math.max(0, Math.min(safeMax, (newX / rect.width) * safeMax));
      newValue = snapToNearestPoint(newValue);
      onChange(newValue);
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleTouchStart = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    let newValue = Math.max(0, Math.min(safeMax, (x / rect.width) * safeMax));
    newValue = snapToNearestPoint(newValue);
    onChange(newValue);
    
    const handleTouchMove = (moveEvent) => {
      moveEvent.preventDefault();
      const touch = moveEvent.touches[0];
      const newX = touch.clientX - rect.left;
      let newValue = Math.max(0, Math.min(safeMax, (newX / rect.width) * safeMax));
      newValue = snapToNearestPoint(newValue);
      onChange(newValue);
    };
    
    const handleTouchEnd = () => {
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
    
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {icon && <span className="text-xl">{icon}</span>}
          <span className="font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold" style={{ color: colors.primary }}>
          {itemKey === 'agua' 
            ? `${Math.round(safeValue)}ml/${safeMax}ml`
            : `${Math.round(safeValue)}/${safeMax}`}
        </span>
      </div>
      <div
        className="w-full h-8 rounded-lg cursor-pointer relative overflow-hidden border-2"
        style={{ 
          backgroundColor: colors.background,
          borderColor: colors.accent
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
      >
        <div
          className="h-full rounded-lg transition-all"
          style={{
            width: `${percentage}%`,
            backgroundColor: colors.primary
          }}
        />
        <div
          className="absolute top-0 right-0 h-full w-2 cursor-ew-resize"
          style={{
            left: `${percentage}%`,
            transform: 'translateX(-50%)',
            backgroundColor: colors.secondary,
            borderRadius: '0 8px 8px 0'
          }}
        />
      </div>
    </div>
  );
}

