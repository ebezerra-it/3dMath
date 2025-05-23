function fillTriangleTexture(p0, p1, p2, myTexture, myTextureWidth, ptxt0, ptxt1, ptxt2, txtLinePrecision, txtPointPrecision, id) {
  
  const getLine = (p0, p1) => {
    let x0 = p0.x;
    let y0 = p0.y;
    const x1 = p1.x;
    const y1 = p1.y;

    const dx = Math.abs(x1 - x0);
    const sx = x0 < x1 ? 1 : -1;
    const dy = -Math.abs(y1 - y0);
    const sy = y0 < y1 ? 1 : -1;
    let error = dx + dy;
    let e2;

    let i = 0;
    let endLine = false;
    const arrayLine = [];

    while (true) {
      arrayLine.push({x: x0, y: y0});

      if (x0 == x1 && y0 == y1) break;
      e2 = 2 * error;
      if (e2 >= dy) {
          if (x0 == x1) break;
          error = error + dy;
          x0 = x0 + sx;
      }
      if (e2 <= dx) {
          if (y0 == y1) break;
          error = error + dx;
          y0 = y0 + sy;
      }
    }
    return arrayLine;
  }
    
  const line1 = getLine(p0, p2);
  const line2 = getLine(p0, p1);

  const d2 = line2.length / line1.length;

  const lineTxt1 = getLine(ptxt0, ptxt2);
  const lineTxt2 = getLine(ptxt0, ptxt1);

  const dwhtext = lineTxt1.length / lineTxt2.length;
  const dline1 = lineTxt1.length / line1.length;
  const dline2 = lineTxt2.length / line2.length;

  const txtWTimes4 = myTextureWidth * 4;
  
  let ii = 0, jj = 0;
  const myTriangle = [];
  
  for (let i=0; i<line1.length; i+=txtLinePrecision) {
    ii++;
    const pp0 = line1[Math.floor(i)];
    const pp1 = line2[Math.floor(i * d2)];

    const pp0tx = lineTxt1[Math.floor(i * dline1)];
    const pp1tx = lineTxt2[Math.floor(i * d2 * dwhtext * dline2)]
    

    const lineDraw = getLine(pp0, pp1);
    const lineTx = getLine(pp0tx, pp1tx);
    const ddrawtx = lineTx.length / lineDraw.length;
        
    for (let j=0;j<lineDraw.length;j+=txtPointPrecision) {
      jj++;
      const ddrawtxTimesJ = Math.floor(j*ddrawtx);
      const offset = lineTx[ddrawtxTimesJ].y * txtWTimes4 + lineTx[ddrawtxTimesJ].x * 4;
      
      const r = myTexture[offset];
      const g = myTexture[offset + 1];
      const b = myTexture[offset + 2];
      const a = myTexture[offset + 3];

      myTriangle.push({
        x: lineDraw[j].x, 
        y: lineDraw[j].y,
        r,
        g,
        b,
        a
      });
    }
  }

  postMessage({ triangle: myTriangle, id });
}

self.onmessage = (msg) => {
  const p0 = msg.data.p0;
  const p1 = msg.data.p1;
  const p2 = msg.data.p2;
  const myTexture = msg.data.myTexture;
  const myTextureWidth = msg.data.myTextureWidth;
  const ptxt0 = msg.data.ptxt0;
  const ptxt1 = msg.data.ptxt1;
  const ptxt2 = msg.data.ptxt2;
  const txtLinePrecision = msg.data.txtLinePrecision;
  const txtPointPrecision = msg.data.txtPointPrecision;
  const id = msg.data.id;
  
  fillTriangleTexture(p0, p1, p2, myTexture, myTextureWidth, ptxt0, ptxt1, ptxt2, txtLinePrecision, txtPointPrecision, id);
}