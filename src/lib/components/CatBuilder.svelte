<!-- src/lib/components/CatBuilder.svelte -->
<script>
  import { onMount, createEventDispatcher } from 'svelte';
  
  const dispatch = createEventDispatcher();
  
  // Данные о породах
  const BREEDS = {
    british: {
      name: 'Британская короткошёрстная',
      earType: 'round',
      bodyType: {
        length: 0.9,
        height: 1.0,
        legLength: 0.8,
        headSize: 1.0
      },
      muzzle: {
        width: 1.1,
        height: 1.0,
        yOffset: 13
      },
      tail: {
        length: 0.7,
        thickness: 1.2,
        curl: 0.6
      },
      allowedFurColors: ['#bfbfbf', '#2f2f2f', '#ffffff', '#f2c27d'],
      eyeColors: ['#a7862a', '#6b6b6b', '#2a9d8f']
    },
    siamese: {
      name: 'Сиамская',
      earType: 'pointy',
      bodyType: {
        length: 0.7,
        height: 0.85,
        legLength: 1.1,
        headSize: 0.9
      },
      muzzle: {
        width: 0.8,
        height: 1.2,
        yOffset: 10
      },
      tail: {
        length: 1.2,
        thickness: 0.7,
        curl: 1.3
      },
      pointColor: '#8d6e63',
      allowedFurColors: ['#f2c27d'],
      eyeColors: ['#3a5ba0']
    },
    mainecoon: {
      name: 'Мейн-кун',
      earType: 'pointy',
      bodyType: {
        length: 1.2,
        height: 1.0,
        legLength: 1.0,
        headSize: 1.05
      },
      muzzle: {
        width: 1.1,
        height: 1.0,
        yOffset: 15
      },
      tail: {
        length: 1.3,
        thickness: 1.1,
        curl: 1.0
      },
      allowedFurColors: ['#8d6e63', '#2f2f2f', '#f2c27d'],
      eyeColors: ['#2a9d8f', '#a7862a']
    }
  };

  const OUTLINE = '#333';
  const OUTLINE_WIDTH = 1;

  // состояние кота
  let catState = {
    breed: 'british',
    fat: 0.5,
    furColor: '#bfbfbf',
    eyeColor: '#a7862a'
  };

  // Функции для работы с цветами
  function hexToRgb(hex) {
    if (!hex) return { r: 0, g: 0, b: 0 };
    const n = parseInt(hex.slice(1), 16);
    return {
      r: (n >> 16) & 255,
      g: (n >> 8) & 255,
      b: n & 255
    };
  }

  function mixColors(c1, c2, t) {
    const a = hexToRgb(c1);
    const b = hexToRgb(c2);
    const r = Math.round(a.r + (b.r - a.r) * t);
    const g = Math.round(a.g + (b.g - a.g) * t);
    const b2 = Math.round(a.b + (b.b - a.b) * t);
    return `rgb(${r},${g},${b2})`;
  }

  function furFor(part, baseFur, breed) {
    if (!breed.pointColor) return baseFur || '#bfbfbf';
    const pointParts = ['ears', 'muzzle', 'tail', 'legs'];
    return pointParts.includes(part) ? breed.pointColor : (baseFur || '#bfbfbf');
  }

  function innerEarColor(fur) {
    return mixColors(fur || '#bfbfbf', '#f4b6c2', 0.35);
  }

  function noseColor(fur) {
    return mixColors(fur || '#bfbfbf', '#8d5a5a', 0.6);
  }

  function setEllipse(el, cx, cy, rx, ry, fill, stroke = 'none', strokeWidth = 0) {
    if (!el) return;
    el.setAttribute('cx', cx);
    el.setAttribute('cy', cy);
    el.setAttribute('rx', rx);
    el.setAttribute('ry', ry);
    el.setAttribute('fill', fill || '#bfbfbf');
    el.setAttribute('stroke', stroke);
    el.setAttribute('stroke-width', strokeWidth);
  }

  function setCircle(el, cx, cy, r, fill) {
    if (!el) return;
    el.setAttribute('cx', cx);
    el.setAttribute('cy', cy);
    el.setAttribute('r', r);
    el.setAttribute('fill', fill || '#ffffff');
  }

  function drawClaws(claws, cx, cy, dir, scale = 1) {
    const spacing = 4 * scale;
    const length = 6 * scale;

    claws.forEach((claw, i) => {
      if (!claw) return;
      const offsetX = (i - 1) * spacing;
      claw.setAttribute('x1', cx + offsetX);
      claw.setAttribute('y1', cy);
      claw.setAttribute('x2', cx + offsetX);
      claw.setAttribute('y2', cy + length * dir);
      claw.setAttribute('stroke', '#eee');
      claw.setAttribute('stroke-width', 1);
      claw.setAttribute('stroke-linecap', 'round');
    });
  }

  // Основные функции конструктора
  function setFurColor(color) {
    catState = {
      ...catState,
      furColor: color
    };
    updateCat();
  }

  function setEyeColor(color) {
    catState = {
      ...catState,
      eyeColor: color
    };
    updateCat();
  }

  function setBreed(breedId) {
    const breed = BREEDS[breedId];
    if (!breed) return;

    catState = {
      breed: breedId,
      fat: catState.fat,
      furColor: breed.allowedFurColors[0],
      eyeColor: breed.eyeColors[0]
    };
    updateCat();
  }

  function updateFat(value) {
    catState = {
      ...catState,
      fat: parseFloat(value)
    };
    updateCat();
  }

  // Основная функция отрисовки
  function updateCat() {
    if (typeof document === 'undefined') return;
    
    const breed = BREEDS[catState.breed];
    const bt = breed.bodyType;
    const fur = catState.furColor || BREEDS[catState.breed].allowedFurColors[0];
    const eyes = catState.eyeColor || BREEDS[catState.breed].eyeColors[0];
    const legColor = furFor('legs', fur, breed);

    // -------- тело --------
    const bodyRX = (50 + 30 * catState.fat) * bt.length;
    const bodyRY = (80 - 20 * catState.fat) * bt.height;

    setEllipse(
      document.getElementById('builder-body'),
      150, 185, bodyRX, bodyRY,
      furFor('body', fur, breed),
      OUTLINE, OUTLINE_WIDTH
    );
    
    // -------- задние лапы --------
    const backLegH = 20 * bt.legLength;

    setEllipse(document.getElementById('builder-legBackL'), 135, 255, 16, backLegH, legColor, OUTLINE, OUTLINE_WIDTH);
    setEllipse(document.getElementById('builder-legBackR'), 165, 255, 16, backLegH, legColor, OUTLINE, OUTLINE_WIDTH);

    // -------- передние лапы (грудь) --------
    const frontLegH = 20 * bt.legLength;

    setEllipse(document.getElementById('builder-legFrontL'), 130, 195, 14, frontLegH, legColor, OUTLINE, OUTLINE_WIDTH);
    setEllipse(document.getElementById('builder-legFrontR'), 170, 195, 14, frontLegH, legColor, OUTLINE, OUTLINE_WIDTH);
    
    // -------- подушечки передних лап --------
    setEllipse(
      document.getElementById('builder-padFrontL'),
      130,
      188 + frontLegH * 0.55,
      16 * 0.55,
      frontLegH * 0.5,
      mixColors(legColor, '#f2a7a7', 0.6),
      OUTLINE,
      0.5
    );

    setEllipse(
      document.getElementById('builder-padFrontR'),
      170,
      188 + frontLegH * 0.55,
      16 * 0.55,
      frontLegH * 0.5,
      mixColors(legColor, '#f2a7a7', 0.6),
      OUTLINE,
      0.5
    );
      
    // -------- когти передних лап --------
    const clawFL = [
      document.getElementById('builder-clawFL1'),
      document.getElementById('builder-clawFL2'),
      document.getElementById('builder-clawFL3'),
    ];

    const clawFR = [
      document.getElementById('builder-clawFR1'),
      document.getElementById('builder-clawFR2'),
      document.getElementById('builder-clawFR3'),
    ];

    drawClaws(clawFL, 130, 185 - frontLegH * 0.2, -1, bt.legLength);
    drawClaws(clawFR, 170, 185 - frontLegH * 0.2, -1, bt.legLength);

    // -------- когти задних лап --------
    const clawBL = [
      document.getElementById('builder-clawBL1'),
      document.getElementById('builder-clawBL2'),
      document.getElementById('builder-clawBL3'),
    ];

    const clawBR = [
      document.getElementById('builder-clawBR1'),
      document.getElementById('builder-clawBR2'),
      document.getElementById('builder-clawBR3'),
    ];

    drawClaws(clawBL, 135, 265 + backLegH * 0.2, 1, bt.legLength);
    drawClaws(clawBR, 165, 265 + backLegH * 0.2, 1, bt.legLength);

    // -------- хвост --------
    const tailCfg = breed.tail;
    const tailStartX = 150 + bodyRX;
    const tailStartY = 190;
    const tailLen = 80 * tailCfg.length;
    const tailCurl = 60 * tailCfg.curl;
    const tailThickness = 14 * tailCfg.thickness;

    const tailPath = `M ${tailStartX} ${tailStartY} C ${tailStartX + tailLen * 0.6} ${tailStartY - tailCurl}, ${tailStartX + tailLen} ${tailStartY - tailCurl}, ${tailStartX + tailLen} ${tailStartY - tailCurl * 0.5}`;

    const tailOutline = document.getElementById('builder-tailOutline');
    const tail = document.getElementById('builder-tail');

    if (tailOutline) {
      tailOutline.setAttribute('d', tailPath);
      tailOutline.setAttribute('stroke', OUTLINE);
      tailOutline.setAttribute('stroke-width', tailThickness + OUTLINE_WIDTH * 2);
      tailOutline.setAttribute('fill', 'none');
      tailOutline.setAttribute('stroke-linecap', 'round');
    }

    if (tail) {
      tail.setAttribute('d', tailPath);
      tail.setAttribute('stroke', furFor('tail', fur, breed));
      tail.setAttribute('stroke-width', tailThickness);
      tail.setAttribute('fill', 'none');
      tail.setAttribute('stroke-linecap', 'round');
    }

    // -------- голова --------
    setEllipse(
      document.getElementById('builder-head'),
      150, 115,
      60 * bt.headSize,
      50 * bt.headSize,
      fur,
      OUTLINE,
      OUTLINE_WIDTH
    );

    // -------- морда --------
    const mz = breed.muzzle;
    setEllipse(
      document.getElementById('builder-muzzle'),
      150,
      125 + mz.yOffset,
      30 * mz.width,
      20 * mz.height,
      furFor('muzzle', fur, breed),
      OUTLINE,
      0.5
    );
    
    // -------- нос --------
    const nose = document.getElementById('builder-nose');
    if (nose) {
      nose.setAttribute('points', '150,132 144,138 156,138');
      nose.setAttribute('fill', noseColor(fur));
      nose.setAttribute('stroke', OUTLINE);
      nose.setAttribute('stroke-width', 0.5);
    }

    // -------- рот --------
    const mouthL = document.getElementById('builder-mouthL');
    const mouthR = document.getElementById('builder-mouthR');
    
    if (mouthL) {
      mouthL.setAttribute('d', 'M 150 138 Q 145 145 140 144');
      mouthL.setAttribute('fill', 'none');
      mouthL.setAttribute('stroke', OUTLINE);
      mouthL.setAttribute('stroke-width', 0.8);
      mouthL.setAttribute('stroke-linecap', 'round');
    }
    
    if (mouthR) {
      mouthR.setAttribute('d', 'M 150 138 Q 155 145 160 144');
      mouthR.setAttribute('fill', 'none');
      mouthR.setAttribute('stroke', OUTLINE);
      mouthR.setAttribute('stroke-width', 0.8);
      mouthR.setAttribute('stroke-linecap', 'round');
    }

    // -------- усы --------
    const whiskers = [
      [document.getElementById('builder-whiskerL1'), 140, 140, 95, 138],
      [document.getElementById('builder-whiskerL2'), 140, 144, 95, 144],
      [document.getElementById('builder-whiskerL3'), 140, 148, 95, 150],
      [document.getElementById('builder-whiskerR1'), 160, 140, 205, 138],
      [document.getElementById('builder-whiskerR2'), 160, 144, 205, 144],
      [document.getElementById('builder-whiskerR3'), 160, 148, 205, 150],
    ];

    whiskers.forEach(([el, x1, y1, x2, y2]) => {
      if (!el) return;
      el.setAttribute('x1', x1);
      el.setAttribute('y1', y1);
      el.setAttribute('x2', x2);
      el.setAttribute('y2', y2);
      el.setAttribute('stroke', '#555');
      el.setAttribute('stroke-width', 0.8);
      el.setAttribute('stroke-linecap', 'round');
    });

    // -------- уши --------
    const earFill = furFor('ears', fur, breed);
    const innerEar = innerEarColor(fur);

    if (breed.earType === 'pointy') {
      const earL = document.getElementById('builder-earL');
      const earR = document.getElementById('builder-earR');
      const earInnerL = document.getElementById('builder-earInnerL');
      const earInnerR = document.getElementById('builder-earInnerR');
      const earRoundL = document.getElementById('builder-earRoundL');
      const earRoundR = document.getElementById('builder-earRoundR');
      const earInnerRoundL = document.getElementById('builder-earInnerRoundL');
      const earInnerRoundR = document.getElementById('builder-earInnerRoundR');

      if (earL) {
        earL.setAttribute('points', '120,45 100,95 140,95');
        earL.setAttribute('fill', earFill);
        earL.setAttribute('stroke', OUTLINE);
        earL.setAttribute('stroke-width', OUTLINE_WIDTH);
        earL.style.display = 'block';
      }

      if (earR) {
        earR.setAttribute('points', '180,45 160,95 200,95');
        earR.setAttribute('fill', earFill);
        earR.setAttribute('stroke', OUTLINE);
        earR.setAttribute('stroke-width', OUTLINE_WIDTH);
        earR.style.display = 'block';
      }

      if (earInnerL) {
        earInnerL.setAttribute('points', '120,55 108,90 132,90');
        earInnerL.setAttribute('fill', innerEar);
        earInnerL.setAttribute('stroke', OUTLINE);
        earInnerL.setAttribute('stroke-width', OUTLINE_WIDTH);
        earInnerL.style.display = 'block';
      }

      if (earInnerR) {
        earInnerR.setAttribute('points', '180,55 168,90 192,90');
        earInnerR.setAttribute('fill', innerEar);
        earInnerR.setAttribute('stroke', OUTLINE);
        earInnerR.setAttribute('stroke-width', OUTLINE_WIDTH);
        earInnerR.style.display = 'block';
      }

      if (earRoundL) earRoundL.style.display = 'none';
      if (earRoundR) earRoundR.style.display = 'none';
      if (earInnerRoundL) earInnerRoundL.style.display = 'none';
      if (earInnerRoundR) earInnerRoundR.style.display = 'none';

    } else {
      const earRoundL = document.getElementById('builder-earRoundL');
      const earRoundR = document.getElementById('builder-earRoundR');
      const earInnerRoundL = document.getElementById('builder-earInnerRoundL');
      const earInnerRoundR = document.getElementById('builder-earInnerRoundR');
      const earL = document.getElementById('builder-earL');
      const earR = document.getElementById('builder-earR');
      const earInnerL = document.getElementById('builder-earInnerL');
      const earInnerR = document.getElementById('builder-earInnerR');

      if (earRoundL) {
        earRoundL.setAttribute('cx', '120');
        earRoundL.setAttribute('cy', '75');
        earRoundL.setAttribute('rx', '22');
        earRoundL.setAttribute('ry', '22');
        earRoundL.setAttribute('fill', earFill);
        earRoundL.setAttribute('stroke', OUTLINE);
        earRoundL.setAttribute('stroke-width', OUTLINE_WIDTH);
        earRoundL.style.display = 'block';
      }

      if (earRoundR) {
        earRoundR.setAttribute('cx', '180');
        earRoundR.setAttribute('cy', '75');
        earRoundR.setAttribute('rx', '22');
        earRoundR.setAttribute('ry', '22');
        earRoundR.setAttribute('fill', earFill);
        earRoundR.setAttribute('stroke', OUTLINE);
        earRoundR.setAttribute('stroke-width', OUTLINE_WIDTH);
        earRoundR.style.display = 'block';
      }

      if (earInnerRoundL) {
        earInnerRoundL.setAttribute('cx', '120');
        earInnerRoundL.setAttribute('cy', '75');
        earInnerRoundL.setAttribute('rx', '12');
        earInnerRoundL.setAttribute('ry', '12');
        earInnerRoundL.setAttribute('fill', innerEar);
        earInnerRoundL.setAttribute('stroke', OUTLINE);
        earInnerRoundL.setAttribute('stroke-width', OUTLINE_WIDTH);
        earInnerRoundL.style.display = 'block';
      }

      if (earInnerRoundR) {
        earInnerRoundR.setAttribute('cx', '180');
        earInnerRoundR.setAttribute('cy', '75');
        earInnerRoundR.setAttribute('rx', '12');
        earInnerRoundR.setAttribute('ry', '12');
        earInnerRoundR.setAttribute('fill', innerEar);
        earInnerRoundR.setAttribute('stroke', OUTLINE);
        earInnerRoundR.setAttribute('stroke-width', OUTLINE_WIDTH);
        earInnerRoundR.style.display = 'block';
      }

      if (earL) earL.style.display = 'none';
      if (earR) earR.style.display = 'none';
      if (earInnerL) earInnerL.style.display = 'none';
      if (earInnerR) earInnerR.style.display = 'none';
    }

    // -------- глаза --------
    setEllipse(document.getElementById('builder-eyeWhiteL'), 135, 120, 10, 14, '#ffffff', OUTLINE, 0.5);
    setEllipse(document.getElementById('builder-eyeWhiteR'), 165, 120, 10, 14, '#ffffff', OUTLINE, 0.5);
    setEllipse(document.getElementById('builder-eyeIrisL'), 135, 122, 6, 8, eyes);
    setEllipse(document.getElementById('builder-eyeIrisR'), 165, 122, 6, 8, eyes);
    setEllipse(document.getElementById('builder-eyePupilL'), 135, 124, 2, 6, '#000000');
    setEllipse(document.getElementById('builder-eyePupilR'), 165, 124, 2, 6, '#000000');
    setCircle(document.getElementById('builder-eyeHighlightL'), 132, 116, 2, '#ffffff');
    setCircle(document.getElementById('builder-eyeHighlightR'), 162, 116, 2, '#ffffff');
  }

  // События
  function addToCart() {
    const catConfig = {
      id: Date.now().toString(),
      breed: catState.breed,
      fat: catState.fat,
      furColor: catState.furColor,
      eyeColor: catState.eyeColor,
      eyes: getEyeColorName(catState.eyeColor),
      fur: getFurType(catState.breed),
      thickness: getThickness(catState.fat),
      price: 15000 + Math.floor(Math.random() * 10000)
    };
    
    dispatch('addToCart', catConfig);
    alert('Котик добавлен в корзину!');
  }
  
  function resetBuilder() {
    const breed = BREEDS[catState.breed];
    catState = {
      breed: catState.breed,
      fat: 0.5,
      furColor: breed.allowedFurColors[0],
      eyeColor: breed.eyeColors[0]
    };
    updateCat();
  }

  function getEyeColorName(color) {
    const colors = {
      '#a7862a': 'Золотистые',
      '#6b6b6b': 'Серые',
      '#2a9d8f': 'Зеленые',
      '#3a5ba0': 'Голубые'
    };
    return colors[color] || 'Золотистые';
  }

  function getFurType(breed) {
    const types = {
      'british': 'Короткая',
      'siamese': 'Короткая',
      'mainecoon': 'Длинная'
    };
    return types[breed] || 'Короткая';
  }

  function getThickness(fat) {
    return Math.round(fat * 5);
  }

  // Инициализация
  onMount(() => {
    updateCat();
  });
</script>

<div class="cat-builder-container">
  <!-- SVG КОТИК -->
  <div class="cat-svg-container">
    <svg width="350" height="350" viewBox="0 0 340 300" class="cat-svg">
      <!-- хвост (обводка + хвост) -->
      <path id="builder-tailOutline" fill="none" stroke-linecap="round"/>
      <path id="builder-tail" fill="none" stroke-linecap="round"/>

      <!-- задние лапы -->
      <ellipse id="builder-legBackL"/>
      <ellipse id="builder-legBackR"/>

      <!-- тело -->
      <ellipse id="builder-body"/>

      <!-- передние лапы -->
      <ellipse id="builder-legFrontL"/>
      <ellipse id="builder-legFrontR"/>
      
      <!-- подушечки передних лап -->
      <ellipse id="builder-padFrontL"/>
      <ellipse id="builder-padFrontR"/>
      
      <!-- когти передние -->
      <line id="builder-clawFL1"/><line id="builder-clawFL2"/><line id="builder-clawFL3"/>
      <line id="builder-clawFR1"/><line id="builder-clawFR2"/><line id="builder-clawFR3"/>

      <!-- когти задние -->
      <line id="builder-clawBL1"/><line id="builder-clawBL2"/><line id="builder-clawBL3"/>
      <line id="builder-clawBR1"/><line id="builder-clawBR2"/><line id="builder-clawBR3"/>

      <!-- уши -->
      <polygon id="builder-earL"/>
      <polygon id="builder-earR"/>
      <ellipse id="builder-earRoundL"/>
      <ellipse id="builder-earRoundR"/>

      <!-- внутренности ушей -->
      <polygon id="builder-earInnerL"/>
      <polygon id="builder-earInnerR"/>
      <ellipse id="builder-earInnerRoundL"/>
      <ellipse id="builder-earInnerRoundR"/>

      <!-- голова -->
      <ellipse id="builder-head"/>

      <!-- морда -->
      <ellipse id="builder-muzzle"/>

      <!-- морда: нос, рот, усы -->
      <polygon id="builder-nose"/>
      <path id="builder-mouthL"/>
      <path id="builder-mouthR"/>

      <!-- усы -->
      <line id="builder-whiskerL1"/>
      <line id="builder-whiskerL2"/>
      <line id="builder-whiskerL3"/>
      <line id="builder-whiskerR1"/>
      <line id="builder-whiskerR2"/>
      <line id="builder-whiskerR3"/>

      <!-- глаза -->
      <!-- белки -->
      <ellipse id="builder-eyeWhiteL"/>
      <ellipse id="builder-eyeWhiteR"/>

      <!-- радужка -->
      <ellipse id="builder-eyeIrisL"/>
      <ellipse id="builder-eyeIrisR"/>

      <!-- зрачок -->
      <ellipse id="builder-eyePupilL"/>
      <ellipse id="builder-eyePupilR"/>

      <!-- блики -->
      <circle id="builder-eyeHighlightL"/>
      <circle id="builder-eyeHighlightR"/>
    </svg>
  </div>
  
  <!-- УПРАВЛЕНИЕ -->
  <div class="builder-controls">
    <div class="control-group">
      <label>Толщина</label>
      <input 
        type="range" 
        min="0.1" 
        max="0.9" 
        step="0.01" 
        value={catState.fat}
        on:input={(e) => updateFat(e.target.value)}
      />
      <span class="value-display">{catState.fat.toFixed(2)}</span>
    </div>

    <div class="control-group">
      <label>Порода</label>
      <select 
        value={catState.breed} 
        on:change={(e) => setBreed(e.target.value)}
      >
        <option value="british">Британская</option>
        <option value="siamese">Сиамская</option>
        <option value="mainecoon">Мейн-кун</option>
      </select>
    </div>
    
    <div class="control-group">
      <label>Цвет глаз</label>
      <div class="color-grid">
        {#each BREEDS[catState.breed].eyeColors as color}
          <button 
            class="color-square {catState.eyeColor === color ? 'selected' : ''}"
            style:background-color={color}
            on:click={() => setEyeColor(color)}
            title="{color === '#a7862a' ? 'Золотистый' : 
                   color === '#6b6b6b' ? 'Серый' : 
                   color === '#2a9d8f' ? 'Зеленый' : 
                   color === '#3a5ba0' ? 'Голубой' : 'Цвет'}"
          >
            {#if catState.eyeColor === color}
              <span class="check">✓</span>
            {/if}
          </button>
        {/each}
      </div>
      <div class="current-color">
        <span>Выбран: </span>
        <div class="selected-color-preview" style:background-color={catState.eyeColor}></div>
      </div>
    </div>

    <div class="control-group">
      <label>Цвет шерсти</label>
      <div class="color-grid">
        {#each BREEDS[catState.breed].allowedFurColors as color}
          <button 
            class="color-square {catState.furColor === color ? 'selected' : ''}"
            style:background-color={color}
            on:click={() => setFurColor(color)}
            title="{color === '#bfbfbf' ? 'Серый' : 
                   color === '#2f2f2f' ? 'Черный' : 
                   color === '#ffffff' ? 'Белый' : 
                   color === '#f2c27d' ? 'Кремовый' : 
                   color === '#8d6e63' ? 'Коричневый' : 'Цвет'}"
          >
            {#if catState.furColor === color}
              <span class="check">✓</span>
            {/if}
          </button>
        {/each}
      </div>
      <div class="current-color">
        <span>Выбран: </span>
        <div class="selected-color-preview" style:background-color={catState.furColor}></div>
      </div>
    </div>

    <div class="builder-actions">
      <button class="btn btn-secondary" on:click={resetBuilder}>Сбросить</button>
      <button class="btn btn-primary" on:click={addToCart}>В корзину</button>
    </div>
  </div>
</div>

<style>
  .cat-builder-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .cat-svg-container {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .cat-svg {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .builder-controls {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 15px 20px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  
  .control-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .control-group label {
    font-weight: 500;
    color: #4a5568;
    display: block;
    margin-top: 10px;
  }
  
  .control-group select,
  .control-group input[type="range"] {
    padding: 0.5rem;
    border: 1px solid #cbd5e0;
    border-radius: 4px;
    font-family: inherit;
  }
  
  .control-group input[type="range"] {
    width: 100%;
  }
  
  .value-display {
    text-align: center;
    font-size: 0.9rem;
    color: #4a5568;
  }
  
  /* Цветовая сетка */
  .color-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .color-square {
    width: 40px;
    height: 40px;
    border: 2px solid #cbd5e0;
    border-radius: 4px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    position: relative;
    padding: 0;
  }
  
  .color-square:hover {
    transform: scale(1.1);
    border-color: #667eea;
  }
  
  .color-square.selected {
    border-color: #667eea;
    box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
  }
  
  .check {
    color: white;
    font-weight: bold;
    font-size: 1.2rem;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }
  
  /* Текущий выбранный цвет */
  .current-color {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .current-color span {
    font-size: 0.9rem;
    color: #4a5568;
  }
  
  .selected-color-preview {
    width: 25px;
    height: 25px;
    border-radius: 4px;
    border: 1px solid #cbd5e0;
  }
  
  .builder-actions {
    display: flex;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .btn {
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.3s ease;
    font-family: inherit;
  }
  
  .btn-primary {
    background: #667eea;
    color: white;
  }
  
  .btn-primary:hover {
    background: #5a67d8;
  }
  
  .btn-secondary {
    background: #a0aec0;
    color: white;
  }
  
  .btn-secondary:hover {
    background: #718096;
  }
  
  @media (max-width: 768px) {
    .cat-builder-container {
      grid-template-columns: 1fr;
    }
    
    .color-grid {
      justify-content: center;
    }
  }
</style>