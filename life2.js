"use strict";

//FFT based smooth life
let INNER_RADIUS = 7.0;
let OUTER_RADIUS = 3 * INNER_RADIUS;
let B1 = 0.278;
let B2 = 0.365;
let D1 = 0.267;
let D2 = 0.445;
let ALPHA_N = 0.028;
let ALPHA_M = 0.147;
let LOG_RES = 7;

//Coloring stuff
let color_shift = [0, 0, 0];
let color_scale = [256, 256, 256];

//Canvas elements
let canvas = document.getElementById("life");
let ctx    = canvas.getContext("2d");
canvas.width = (1<<LOG_RES);
canvas.height = (1<<LOG_RES);

//Buffers
let field_dims = [ (1<<LOG_RES), (1<<LOG_RES) ];
let fields = new Array(2);
for(let i=0; i<fields.length; ++i) {
    fields[i] = numeric.rep(field_dims, 0.0);
}
let imaginary_field = numeric.rep(field_dims, 0.0);
let current_field = 0;
let M_re_buffer = numeric.rep(field_dims, 0.0);
let M_im_buffer = numeric.rep(field_dims, 0.0);
let N_re_buffer = numeric.rep(field_dims, 0,0);
let N_im_buffer = numeric.rep(field_dims, 0.0);


//Initialize kernel
function BesselJ(radius) {
    //Do this in a somewhat stupid way
    let field = numeric.rep(field_dims, 0.0);
    let weight = 0.0;
    for(let i=0; i<field.length; ++i) {
        for(let j=0; j<field.length; ++j) {
            let ii = ((i + field.length/2) % field.length) - field.length/2;
            let jj = ((j + field.length/2) % field.length) - field.length/2;
            
            let r = Math.sqrt(ii*ii + jj*jj) - radius;
            let v = 1.0 / (1.0 + Math.exp(LOG_RES * r));
            
            weight += v;
            field[i][j] = v;
        }
    }
    
    let imag_field = numeric.rep(field_dims, 0.0);
    fft2(1, LOG_RES, field, imag_field);
    return { re: field, im: imag_field, w: weight };
}

//Precalculate multipliers for m,n
let M_re, M_im, N_re, N_im;
(function() {
    let inner_bessel = BesselJ(INNER_RADIUS);
    let outer_bessel = BesselJ(OUTER_RADIUS);
    
    let inner_w = 1.0 / inner_bessel.w;
    let outer_w = 1.0 / (outer_bessel.w - inner_bessel.w);
    
    M_re = inner_bessel.re;
    M_im = inner_bessel.im;
    N_re = outer_bessel.re;
    N_im = outer_bessel.im;
    
    for(let i=0; i<canvas.width; ++i) {
        for(let j=0; j<canvas.height; ++j) {
            N_re[i][j] = outer_w * (N_re[i][j] - M_re[i][j]);
            N_im[i][j] = outer_w * (N_im[i][j] - M_im[i][j]);
            M_re[i][j] *= inner_w;
            M_im[i][j] *= inner_w;
        }
    }
})();


function sigma(x, a, alpha) {
    return 1.0 / (1.0 + Math.exp(-4.0/alpha * (x - a)));
}

function sigma_2(x, a, b) {
    return sigma(x, a, ALPHA_N) * (1.0 - sigma(x, b, ALPHA_N));
}

function lerp(a, b, t) {
    return (1.0-t)*a + t*b;
}

function S(n,m) {
    let alive = sigma(m, 0.5, ALPHA_M);
    return sigma_2(n, lerp(B1, D1, alive), lerp(B2, D2, alive));
}

function field_multiply(a_r, a_i, b_r, b_i, c_r, c_i) {
    for(let i=0; i<field_dims[0]; ++i) {
        let Ar = a_r[i], Ai = a_i[i];
        let Br = b_r[i], Bi = b_i[i];
        let Cr = c_r[i], Ci = c_i[i];
        for(let j=0; j<field_dims[1]; ++j) {
            let a = Ar[j];
            let b = Ai[j];
            let c = Br[j];
            let d = Bi[j];
            let t = a * (c + d);
            Cr[j] = t - d*(a+b);
            Ci[j] = t + c*(b-a);
        }
    }
}

//Applies the kernel to the image
function step() {
    
    //Read in fields
    let cur_field = fields[current_field];
    current_field = (current_field + 1) % fields.length;
    let next_field = fields[current_field];
    
    //Clear extra imaginary field
    for(let i=0; i<field_dims[0]; ++i) {
        for(let j=0; j<field_dims[1]; ++j) {
            imaginary_field[i][j] = 0.0;
        }
    }
    
    //Compute m,n fields
    fft2(1, LOG_RES, cur_field, imaginary_field);
    field_multiply(cur_field, imaginary_field, M_re, M_im, M_re_buffer, M_im_buffer);
    fft2(-1, LOG_RES, M_re_buffer, M_im_buffer);
    field_multiply(cur_field, imaginary_field, N_re, N_im, N_re_buffer, N_im_buffer);
    fft2(-1, LOG_RES, N_re_buffer, N_im_buffer);
    
    //Step s
    for(let i=0; i<next_field.length; ++i) {
        for(let j=0; j<next_field.length; ++j) {
            next_field[i][j] = S(N_re_buffer[i][j], M_re_buffer[i][j]);
        }
    }
}


//FFT
function fft(dir,m,x,y) {
   let nn,i,i1,j,k,i2,l,l1,l2;
   let c1,c2,tx,ty,t1,t2,u1,u2,z;
    
    /* Calculate the number of points */
    nn = x.length;
    
    /* Do the bit reversal */
    i2 = nn >> 1;
    j = 0;
    for (i=0;i<nn-1;i++) {
      if (i < j) {
         tx = x[i];
         ty = y[i];
         x[i] = x[j];
         y[i] = y[j];
         x[j] = tx;
         y[j] = ty;
      }
      k = i2;
      while (k <= j) {
         j -= k;
         k >>= 1;
      }
      j += k;
    }
    
    /* Compute the FFT */
    c1 = -1.0;
    c2 = 0.0;
    l2 = 1;
    for (l=0;l<m;l++) {
      l1 = l2;
      l2 <<= 1;
      u1 = 1.0;
      u2 = 0.0;
      for (j=0;j<l1;j++) {
         for (i=j;i<nn;i+=l2) {
            i1 = i + l1;
            t1 = u1 * x[i1] - u2 * y[i1];
            t2 = u1 * y[i1] + u2 * x[i1];
            x[i1] = x[i] - t1;
            y[i1] = y[i] - t2;
            x[i] += t1;
            y[i] += t2;
         }
         z =  u1 * c1 - u2 * c2;
         u2 = u1 * c2 + u2 * c1;
         u1 = z;
      }
      c2 = Math.sqrt((1.0 - c1) / 2.0);
      if (dir == 1)
         c2 = -c2;
      c1 = Math.sqrt((1.0 + c1) / 2.0);
    }
    
    /* Scaling for forward transform */
    if (dir == -1) {
      let scale_f = 1.0 / nn;        
      for (i=0;i<nn;i++) {
         x[i] *= scale_f;
         y[i] *= scale_f;
      }
    }
}

//In place 2D fft
function fft2(dir, m, x, y) {
  for(let i=0; i<x.length; ++i) {
    fft(dir, m, x[i], y[i]);
  }
  for(let i=0; i<x.length; ++i) {
    for(let j=0; j<i; ++j) {
      let t = x[i][j];
      x[i][j] = x[j][i];
      x[j][i] = t;
    }
  }
  for(let i=0; i<y.length; ++i) {
    for(let j=0; j<i; ++j) {
      let t = y[i][j];
      y[i][j] = y[j][i];
      y[j][i] = t;
    }
  }
  for(let i=0; i<x.length; ++i) {
    fft(dir, m, x[i], y[i]);
  }  
}


//Extract image data
let image_data = ctx.createImageData(field_dims[0], field_dims[1]);
function draw_field() {
    let image_buf = image_data.data;            
    let image_ptr = 0;
    
    let cur_field = fields[current_field];
    
    for(let i=0; i<field_dims[0]; ++i) {
        for(let j=0; j<field_dims[1]; ++j) {
            let s = cur_field[i][j];
        
            for(let k=0; k<3; ++k) {
                image_buf[image_ptr++] = Math.max(0, Math.min(255, Math.floor(color_shift[k] + color_scale[k]*s)));
            }
            image_buf[image_ptr++] = 255;
        }
    }
    ctx.putImageData(image_data, 0, 0);
}

//Initialize field to x
function clear_field(x) {
    let cur_field = fields[current_field];

    for(let i=0; i<field_dims[0]; ++i) {
        for(let j=0; j<field_dims[1]; ++j) {
          cur_field[i][j] = x;
        }
    }
}


//Place a bunch of speckles on the field
function add_speckles(count, intensity) {
    let cur_field = fields[current_field];

    for(let i=0; i<count; ++i) {
        let u = Math.floor(Math.random() * (field_dims[0]-INNER_RADIUS));
        let v = Math.floor(Math.random() * (field_dims[1]-INNER_RADIUS));
        for(let x=0; x<INNER_RADIUS; ++x) {
            for(let y=0; y<INNER_RADIUS; ++y) {
                cur_field[u+x][v+y] = intensity;
            }
        }
    }
}

    
clear_field(0);
add_speckles(200, 1);
step();
draw_field();

setInterval(function(){
    step();
    draw_field();
}, 20);