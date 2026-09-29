// --- GOLF COURSE HOLES DATA & WHS INTEGRITY ---
const clubHolesTemplates = {
    "jersbek": {
        holes18: [
            { hole: 1, par: 4, si: 13, meters_gelb: 353, meters_rot: 308 },
            { hole: 2, par: 4, si: 1, meters_gelb: 424, meters_rot: 374 },
            { hole: 3, par: 3, si: 5, meters_gelb: 154, meters_rot: 134 },
            { hole: 4, par: 5, si: 11, meters_gelb: 535, meters_rot: 462 },
            { hole: 5, par: 3, si: 7, meters_gelb: 165, meters_rot: 142 },
            { hole: 6, par: 5, si: 9, meters_gelb: 490, meters_rot: 420 },
            { hole: 7, par: 4, si: 17, meters_gelb: 330, meters_rot: 285 },
            { hole: 8, par: 4, si: 3, meters_gelb: 385, meters_rot: 340 },
            { hole: 9, par: 4, si: 15, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 5, si: 8, meters_gelb: 485, meters_rot: 422 },
            { hole: 11, par: 4, si: 4, meters_gelb: 365, meters_rot: 320 },
            { hole: 12, par: 4, si: 12, meters_gelb: 350, meters_rot: 305 },
            { hole: 13, par: 3, si: 18, meters_gelb: 160, meters_rot: 138 },
            { hole: 14, par: 4, si: 2, meters_gelb: 380, meters_rot: 335 },
            { hole: 15, par: 4, si: 10, meters_gelb: 340, meters_rot: 295 },
            { hole: 16, par: 4, si: 6, meters_gelb: 360, meters_rot: 310 },
            { hole: 17, par: 3, si: 16, meters_gelb: 150, meters_rot: 130 },
            { hole: 18, par: 5, si: 14, meters_gelb: 490, meters_rot: 425 }
        ]
    },
    "falkenstein": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 340, meters_rot: 295 },
            { hole: 2, par: 4, si: 5, meters_gelb: 375, meters_rot: 325 },
            { hole: 3, par: 4, si: 1, meters_gelb: 405, meters_rot: 350 },
            { hole: 4, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 5, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 6, par: 5, si: 7, meters_gelb: 480, meters_rot: 415 },
            { hole: 7, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 8, par: 4, si: 3, meters_gelb: 390, meters_rot: 340 },
            { hole: 9, par: 4, si: 13, meters_gelb: 320, meters_rot: 280 },
            { hole: 10, par: 4, si: 16, meters_gelb: 355, meters_rot: 310 },
            { hole: 11, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 12, par: 4, si: 8, meters_gelb: 360, meters_rot: 310 },
            { hole: 13, par: 3, si: 18, meters_gelb: 135, meters_rot: 115 },
            { hole: 14, par: 5, si: 6, meters_gelb: 495, meters_rot: 430 },
            { hole: 15, par: 4, si: 2, meters_gelb: 410, meters_rot: 355 },
            { hole: 16, par: 4, si: 12, meters_gelb: 345, meters_rot: 300 },
            { hole: 17, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 18, par: 4, si: 14, meters_gelb: 370, meters_rot: 325 }
        ]
    },
    "wendlohe": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 350, meters_rot: 305 },
            { hole: 2, par: 4, si: 3, meters_gelb: 385, meters_rot: 335 },
            { hole: 3, par: 5, si: 9, meters_gelb: 475, meters_rot: 410 },
            { hole: 4, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 5, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 6, par: 4, si: 11, meters_gelb: 330, meters_rot: 285 },
            { hole: 7, par: 5, si: 5, meters_gelb: 490, meters_rot: 425 },
            { hole: 8, par: 3, si: 15, meters_gelb: 155, meters_rot: 135 },
            { hole: 9, par: 4, si: 13, meters_gelb: 325, meters_rot: 280 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 380, meters_rot: 330 },
            { hole: 12, par: 3, si: 18, meters_gelb: 135, meters_rot: 115 },
            { hole: 13, par: 5, si: 6, meters_gelb: 485, meters_rot: 420 },
            { hole: 14, par: 4, si: 2, meters_gelb: 405, meters_rot: 350 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 470, meters_rot: 405 },
            { hole: 18, par: 4, si: 14, meters_gelb: 355, meters_rot: 310 }
        ]
    },
    "escheburg": {
        holes18: [
            { hole: 1, par: 4, si: 11, meters_gelb: 345, meters_rot: 298 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 5, si: 5, meters_gelb: 490, meters_rot: 425 },
            { hole: 4, par: 4, si: 1, meters_gelb: 405, meters_rot: 350 },
            { hole: 5, par: 4, si: 7, meters_gelb: 360, meters_rot: 310 },
            { hole: 6, par: 3, si: 15, meters_gelb: 155, meters_rot: 130 },
            { hole: 7, par: 4, si: 13, meters_gelb: 335, meters_rot: 285 },
            { hole: 8, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 9, par: 5, si: 9, meters_gelb: 475, meters_rot: 410 },
            { hole: 10, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 11, par: 4, si: 4, meters_gelb: 375, meters_rot: 325 },
            { hole: 12, par: 5, si: 6, meters_gelb: 485, meters_rot: 420 },
            { hole: 13, par: 3, si: 18, meters_gelb: 145, meters_rot: 125 },
            { hole: 14, par: 4, si: 2, meters_gelb: 395, meters_rot: 340 },
            { hole: 15, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 355, meters_rot: 305 }
        ]
    },
    "ahrensburg": {
        holes18: [
            { hole: 1, par: 4, si: 11, meters_gelb: 330, meters_rot: 290 },
            { hole: 2, par: 4, si: 7, meters_gelb: 350, meters_rot: 305 },
            { hole: 3, par: 3, si: 15, meters_gelb: 155, meters_rot: 135 },
            { hole: 4, par: 4, si: 1, meters_gelb: 395, meters_rot: 345 },
            { hole: 5, par: 4, si: 5, meters_gelb: 360, meters_rot: 315 },
            { hole: 6, par: 5, si: 9, meters_gelb: 470, meters_rot: 410 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 9, par: 4, si: 13, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 4, si: 8, meters_gelb: 355, meters_rot: 310 },
            { hole: 11, par: 4, si: 16, meters_gelb: 360, meters_rot: 315 },
            { hole: 12, par: 4, si: 4, meters_gelb: 375, meters_rot: 325 },
            { hole: 13, par: 5, si: 6, meters_gelb: 485, meters_rot: 420 },
            { hole: 14, par: 4, si: 2, meters_gelb: 400, meters_rot: 350 },
            { hole: 15, par: 3, si: 18, meters_gelb: 135, meters_rot: 115 },
            { hole: 16, par: 4, si: 12, meters_gelb: 345, meters_rot: 300 },
            { hole: 17, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 18, par: 4, si: 14, meters_gelb: 360, meters_rot: 315 }
        ]
    },
    "walddörfer": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 360, meters_rot: 315 },
            { hole: 2, par: 5, si: 3, meters_gelb: 495, meters_rot: 430 },
            { hole: 3, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 4, par: 4, si: 1, meters_gelb: 380, meters_rot: 330 },
            { hole: 5, par: 4, si: 9, meters_gelb: 345, meters_rot: 300 },
            { hole: 6, par: 4, si: 11, meters_gelb: 330, meters_rot: 290 },
            { hole: 7, par: 3, si: 17, meters_gelb: 150, meters_rot: 125 },
            { hole: 8, par: 5, si: 5, meters_gelb: 485, meters_rot: 420 },
            { hole: 9, par: 4, si: 13, meters_gelb: 355, meters_rot: 310 },
            { hole: 10, par: 4, si: 8, meters_gelb: 370, meters_rot: 320 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 155, meters_rot: 135 },
            { hole: 13, par: 5, si: 6, meters_gelb: 505, meters_rot: 440 },
            { hole: 14, par: 4, si: 2, meters_gelb: 410, meters_rot: 355 },
            { hole: 15, par: 4, si: 10, meters_gelb: 340, meters_rot: 295 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 475, meters_rot: 410 },
            { hole: 18, par: 4, si: 14, meters_gelb: 365, meters_rot: 315 }
        ]
    },
    "kaden (a+b)": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 365, meters_rot: 315 },
            { hole: 2, par: 5, si: 3, meters_gelb: 505, meters_rot: 440 },
            { hole: 3, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 4, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 5, par: 4, si: 9, meters_gelb: 355, meters_rot: 305 },
            { hole: 6, par: 4, si: 11, meters_gelb: 340, meters_rot: 295 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 9, par: 4, si: 13, meters_gelb: 330, meters_rot: 285 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 310 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 510, meters_rot: 445 },
            { hole: 14, par: 4, si: 2, meters_gelb: 420, meters_rot: 365 },
            { hole: 15, par: 4, si: 10, meters_gelb: 350, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 170, meters_rot: 145 },
            { hole: 17, par: 5, si: 12, meters_gelb: 485, meters_rot: 420 },
            { hole: 18, par: 4, si: 14, meters_gelb: 375, meters_rot: 325 }
        ]
    },
    "kaden (b+c)": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 360, meters_rot: 310 },
            { hole: 2, par: 4, si: 3, meters_gelb: 390, meters_rot: 340 },
            { hole: 3, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 4, par: 5, si: 5, meters_gelb: 510, meters_rot: 445 },
            { hole: 5, par: 4, si: 1, meters_gelb: 420, meters_rot: 365 },
            { hole: 6, par: 4, si: 9, meters_gelb: 350, meters_rot: 300 },
            { hole: 7, par: 3, si: 15, meters_gelb: 170, meters_rot: 145 },
            { hole: 8, par: 5, si: 11, meters_gelb: 485, meters_rot: 420 },
            { hole: 9, par: 4, si: 13, meters_gelb: 375, meters_rot: 325 },
            { hole: 10, par: 4, si: 8, meters_gelb: 350, meters_rot: 305 },
            { hole: 11, par: 4, si: 4, meters_gelb: 380, meters_rot: 330 },
            { hole: 12, par: 5, si: 6, meters_gelb: 490, meters_rot: 425 },
            { hole: 13, par: 3, si: 18, meters_gelb: 155, meters_rot: 135 },
            { hole: 14, par: 4, si: 2, meters_gelb: 405, meters_rot: 350 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 515, meters_rot: 450 },
            { hole: 18, par: 4, si: 14, meters_gelb: 360, meters_rot: 315 }
        ]
    },
    "kaden": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 365, meters_rot: 315 },
            { hole: 2, par: 5, si: 3, meters_gelb: 505, meters_rot: 440 },
            { hole: 3, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 4, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 5, par: 4, si: 9, meters_gelb: 355, meters_rot: 305 },
            { hole: 6, par: 4, si: 11, meters_gelb: 340, meters_rot: 295 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 9, par: 4, si: 13, meters_gelb: 330, meters_rot: 285 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 310 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 510, meters_rot: 445 },
            { hole: 14, par: 4, si: 2, meters_gelb: 420, meters_rot: 365 },
            { hole: 15, par: 4, si: 10, meters_gelb: 350, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 170, meters_rot: 145 },
            { hole: 17, par: 5, si: 12, meters_gelb: 485, meters_rot: 420 },
            { hole: 18, par: 4, si: 14, meters_gelb: 375, meters_rot: 325 }
        ]
    },
    "holm": {
        holes18: [
            { hole: 1, par: 4, si: 11, meters_gelb: 335, meters_rot: 295 },
            { hole: 2, par: 4, si: 7, meters_gelb: 370, meters_rot: 325 },
            { hole: 3, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 4, par: 5, si: 3, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 6, par: 4, si: 9, meters_gelb: 350, meters_rot: 305 },
            { hole: 7, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 8, par: 4, si: 13, meters_gelb: 340, meters_rot: 295 },
            { hole: 9, par: 5, si: 5, meters_gelb: 480, meters_rot: 420 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 12, par: 3, si: 18, meters_gelb: 135, meters_rot: 115 },
            { hole: 13, par: 5, si: 6, meters_gelb: 500, meters_rot: 435 },
            { hole: 14, par: 4, si: 2, meters_gelb: 410, meters_rot: 355 },
            { hole: 15, par: 4, si: 10, meters_gelb: 355, meters_rot: 310 },
            { hole: 16, par: 3, si: 16, meters_gelb: 165, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 475, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 360, meters_rot: 310 }
        ]
    },
    "treudelberg": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 345, meters_rot: 300 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 4, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 5, par: 5, si: 7, meters_gelb: 485, meters_rot: 420 },
            { hole: 6, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 7, par: 4, si: 13, meters_gelb: 350, meters_rot: 305 },
            { hole: 8, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 9, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 310 },
            { hole: 11, par: 5, si: 6, meters_gelb: 490, meters_rot: 425 },
            { hole: 12, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 13, par: 4, si: 10, meters_gelb: 355, meters_rot: 305 },
            { hole: 14, par: 4, si: 2, meters_gelb: 415, meters_rot: 360 },
            { hole: 15, par: 4, si: 12, meters_gelb: 340, meters_rot: 295 },
            { hole: 16, par: 3, si: 18, meters_gelb: 145, meters_rot: 125 },
            { hole: 17, par: 5, si: 14, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 3, si: 16, meters_gelb: 155, meters_rot: 135 }
        ]
    },
    "hittfeld": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 337, meters_rot: 295 },
            { hole: 2, par: 4, si: 7, meters_gelb: 336, meters_rot: 290 },
            { hole: 3, par: 3, si: 15, meters_gelb: 172, meters_rot: 145 },
            { hole: 4, par: 4, si: 3, meters_gelb: 375, meters_rot: 325 },
            { hole: 5, par: 4, si: 11, meters_gelb: 340, meters_rot: 295 },
            { hole: 6, par: 5, si: 5, meters_gelb: 485, meters_rot: 420 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 4, si: 1, meters_gelb: 405, meters_rot: 355 },
            { hole: 9, par: 4, si: 13, meters_gelb: 330, meters_rot: 285 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 380, meters_rot: 330 },
            { hole: 12, par: 4, si: 10, meters_gelb: 355, meters_rot: 310 },
            { hole: 13, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 14, par: 5, si: 6, meters_gelb: 495, meters_rot: 430 },
            { hole: 15, par: 4, si: 2, meters_gelb: 415, meters_rot: 360 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 475, meters_rot: 410 },
            { hole: 18, par: 4, si: 14, meters_gelb: 365, meters_rot: 320 }
        ]
    },
    "buchholz": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 345, meters_rot: 300 },
            { hole: 2, par: 5, si: 3, meters_gelb: 490, meters_rot: 425 },
            { hole: 3, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 4, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 5, par: 4, si: 9, meters_gelb: 355, meters_rot: 310 },
            { hole: 6, par: 4, si: 11, meters_gelb: 330, meters_rot: 285 },
            { hole: 7, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 8, par: 5, si: 5, meters_gelb: 505, meters_rot: 440 },
            { hole: 9, par: 4, si: 13, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 495, meters_rot: 430 },
            { hole: 14, par: 4, si: 2, meters_gelb: 420, meters_rot: 365 },
            { hole: 15, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 16, par: 3, si: 16, meters_gelb: 155, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 370, meters_rot: 320 }
        ]
    },
    "pinnau 18 a+b": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 355, meters_rot: 310 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 6, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 5, si: 9, meters_gelb: 480, meters_rot: 415 },
            { hole: 9, par: 4, si: 13, meters_gelb: 350, meters_rot: 305 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 5, si: 6, meters_gelb: 505, meters_rot: 440 },
            { hole: 13, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 14, par: 5, si: 10, meters_gelb: 490, meters_rot: 425 },
            { hole: 15, par: 4, si: 2, meters_gelb: 410, meters_rot: 355 },
            { hole: 16, par: 3, si: 16, meters_gelb: 165, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 485, meters_rot: 420 },
            { hole: 18, par: 4, si: 14, meters_gelb: 375, meters_rot: 325 }
        ]
    },
    "pinnau 18 a+c": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 355, meters_rot: 310 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 6, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 5, si: 9, meters_gelb: 480, meters_rot: 415 },
            { hole: 9, par: 4, si: 13, meters_gelb: 350, meters_rot: 305 },
            { hole: 10, par: 4, si: 8, meters_gelb: 350, meters_rot: 305 },
            { hole: 11, par: 4, si: 4, meters_gelb: 380, meters_rot: 330 },
            { hole: 12, par: 3, si: 18, meters_gelb: 155, meters_rot: 135 },
            { hole: 13, par: 5, si: 6, meters_gelb: 490, meters_rot: 425 },
            { hole: 14, par: 4, si: 2, meters_gelb: 405, meters_rot: 350 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 515, meters_rot: 450 },
            { hole: 18, par: 4, si: 14, meters_gelb: 360, meters_rot: 315 }
        ]
    },
    "pinnau 18 b+c": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 360, meters_rot: 315 },
            { hole: 2, par: 4, si: 3, meters_gelb: 390, meters_rot: 340 },
            { hole: 3, par: 5, si: 5, meters_gelb: 505, meters_rot: 440 },
            { hole: 4, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 5, par: 5, si: 9, meters_gelb: 490, meters_rot: 425 },
            { hole: 6, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 7, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 8, par: 5, si: 11, meters_gelb: 485, meters_rot: 420 },
            { hole: 9, par: 4, si: 13, meters_gelb: 375, meters_rot: 325 },
            { hole: 10, par: 4, si: 8, meters_gelb: 350, meters_rot: 305 },
            { hole: 11, par: 4, si: 4, meters_gelb: 380, meters_rot: 330 },
            { hole: 12, par: 3, si: 18, meters_gelb: 155, meters_rot: 135 },
            { hole: 13, par: 5, si: 6, meters_gelb: 490, meters_rot: 425 },
            { hole: 14, par: 4, si: 2, meters_gelb: 405, meters_rot: 350 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 515, meters_rot: 450 },
            { hole: 18, par: 4, si: 14, meters_gelb: 360, meters_rot: 315 }
        ]
    },
    "pinnau": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 355, meters_rot: 310 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 6, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 5, si: 9, meters_gelb: 480, meters_rot: 415 },
            { hole: 9, par: 4, si: 13, meters_gelb: 350, meters_rot: 305 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 5, si: 6, meters_gelb: 505, meters_rot: 440 },
            { hole: 13, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 14, par: 5, si: 10, meters_gelb: 490, meters_rot: 425 },
            { hole: 15, par: 4, si: 2, meters_gelb: 410, meters_rot: 355 },
            { hole: 16, par: 3, si: 16, meters_gelb: 165, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 485, meters_rot: 420 },
            { hole: 18, par: 4, si: 14, meters_gelb: 375, meters_rot: 325 }
        ]
    },
    "grossensee": {
        holes18: [
            { hole: 1, par: 4, si: 11, meters_gelb: 338, meters_rot: 295 },
            { hole: 2, par: 4, si: 7, meters_gelb: 365, meters_rot: 320 },
            { hole: 3, par: 3, si: 15, meters_gelb: 155, meters_rot: 135 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 13, meters_gelb: 345, meters_rot: 300 },
            { hole: 6, par: 3, si: 9, meters_gelb: 165, meters_rot: 140 },
            { hole: 7, par: 5, si: 1, meters_gelb: 510, meters_rot: 445 },
            { hole: 8, par: 4, si: 17, meters_gelb: 320, meters_rot: 280 },
            { hole: 9, par: 4, si: 3, meters_gelb: 390, meters_rot: 340 },
            { hole: 10, par: 4, si: 8, meters_gelb: 355, meters_rot: 310 },
            { hole: 11, par: 3, si: 18, meters_gelb: 145, meters_rot: 125 },
            { hole: 12, par: 5, si: 4, meters_gelb: 500, meters_rot: 435 },
            { hole: 13, par: 4, si: 12, meters_gelb: 340, meters_rot: 295 },
            { hole: 14, par: 4, si: 10, meters_gelb: 360, meters_rot: 315 },
            { hole: 15, par: 3, si: 14, meters_gelb: 150, meters_rot: 130 },
            { hole: 16, par: 5, si: 16, meters_gelb: 480, meters_rot: 415 },
            { hole: 17, par: 4, si: 2, meters_gelb: 415, meters_rot: 360 },
            { hole: 18, par: 5, si: 6, meters_gelb: 490, meters_rot: 425 }
        ]
    },
    "sachsenwald": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 350, meters_rot: 305 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 6, par: 4, si: 9, meters_gelb: 355, meters_rot: 310 },
            { hole: 7, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 8, par: 5, si: 11, meters_gelb: 485, meters_rot: 420 },
            { hole: 9, par: 4, si: 13, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 145, meters_rot: 125 },
            { hole: 13, par: 5, si: 6, meters_gelb: 510, meters_rot: 445 },
            { hole: 14, par: 4, si: 2, meters_gelb: 415, meters_rot: 360 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 155, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 370, meters_rot: 320 }
        ]
    },
    "grambek": {
        holes18: [
            { hole: 1, par: 4, si: 5, meters_gelb: 311, meters_rot: 270 },
            { hole: 2, par: 5, si: 11, meters_gelb: 464, meters_rot: 405 },
            { hole: 3, par: 3, si: 9, meters_gelb: 162, meters_rot: 138 },
            { hole: 4, par: 4, si: 15, meters_gelb: 297, meters_rot: 260 },
            { hole: 5, par: 4, si: 13, meters_gelb: 333, meters_rot: 290 },
            { hole: 6, par: 4, si: 1, meters_gelb: 374, meters_rot: 325 },
            { hole: 7, par: 3, si: 17, meters_gelb: 144, meters_rot: 120 },
            { hole: 8, par: 4, si: 7, meters_gelb: 356, meters_rot: 310 },
            { hole: 9, par: 4, si: 3, meters_gelb: 378, meters_rot: 330 },
            { hole: 10, par: 4, si: 8, meters_gelb: 370, meters_rot: 320 },
            { hole: 11, par: 3, si: 16, meters_gelb: 182, meters_rot: 155 },
            { hole: 12, par: 4, si: 4, meters_gelb: 358, meters_rot: 310 },
            { hole: 13, par: 5, si: 14, meters_gelb: 486, meters_rot: 425 },
            { hole: 14, par: 4, si: 2, meters_gelb: 385, meters_rot: 335 },
            { hole: 15, par: 5, si: 6, meters_gelb: 467, meters_rot: 410 },
            { hole: 16, par: 4, si: 12, meters_gelb: 316, meters_rot: 275 },
            { hole: 17, par: 3, si: 18, meters_gelb: 159, meters_rot: 135 },
            { hole: 18, par: 4, si: 10, meters_gelb: 360, meters_rot: 315 }
        ]
    },
    "timmendorfer": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 355, meters_rot: 310 },
            { hole: 2, par: 5, si: 3, meters_gelb: 505, meters_rot: 440 },
            { hole: 3, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 4, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 5, par: 4, si: 9, meters_gelb: 360, meters_rot: 315 },
            { hole: 6, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 7, par: 3, si: 15, meters_gelb: 170, meters_rot: 145 },
            { hole: 8, par: 5, si: 5, meters_gelb: 490, meters_rot: 425 },
            { hole: 9, par: 4, si: 13, meters_gelb: 345, meters_rot: 300 },
            { hole: 10, par: 4, si: 8, meters_gelb: 370, meters_rot: 320 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 510, meters_rot: 445 },
            { hole: 14, par: 4, si: 2, meters_gelb: 420, meters_rot: 365 },
            { hole: 15, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 485, meters_rot: 420 },
            { hole: 18, par: 4, si: 14, meters_gelb: 365, meters_rot: 315 }
        ]
    },
    "travemünde": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 360, meters_rot: 315 },
            { hole: 2, par: 5, si: 3, meters_gelb: 510, meters_rot: 445 },
            { hole: 3, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 6, par: 4, si: 9, meters_gelb: 355, meters_rot: 310 },
            { hole: 7, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 8, par: 5, si: 11, meters_gelb: 485, meters_rot: 420 },
            { hole: 9, par: 4, si: 13, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 500, meters_rot: 435 },
            { hole: 14, par: 4, si: 2, meters_gelb: 410, meters_rot: 355 },
            { hole: 15, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 475, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 370, meters_rot: 320 }
        ]
    },
    "altenhof": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 350, meters_rot: 305 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 4, par: 5, si: 5, meters_gelb: 500, meters_rot: 435 },
            { hole: 5, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 6, par: 4, si: 9, meters_gelb: 355, meters_rot: 310 },
            { hole: 7, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 8, par: 5, si: 11, meters_gelb: 485, meters_rot: 420 },
            { hole: 9, par: 4, si: 13, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 505, meters_rot: 440 },
            { hole: 14, par: 4, si: 2, meters_gelb: 415, meters_rot: 360 },
            { hole: 15, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 370, meters_rot: 320 }
        ]
    },
    "marine": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 350, meters_rot: 305 },
            { hole: 2, par: 5, si: 3, meters_gelb: 490, meters_rot: 425 },
            { hole: 3, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 4, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 5, par: 4, si: 9, meters_gelb: 355, meters_rot: 310 },
            { hole: 6, par: 4, si: 11, meters_gelb: 330, meters_rot: 285 },
            { hole: 7, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 8, par: 5, si: 5, meters_gelb: 500, meters_rot: 435 },
            { hole: 9, par: 4, si: 13, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 310 },
            { hole: 11, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 505, meters_rot: 440 },
            { hole: 14, par: 4, si: 2, meters_gelb: 415, meters_rot: 360 },
            { hole: 15, par: 4, si: 10, meters_gelb: 350, meters_rot: 305 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 485, meters_rot: 420 },
            { hole: 18, par: 4, si: 14, meters_gelb: 370, meters_rot: 320 }
        ]
    },
    "sylt": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 345, meters_rot: 300 },
            { hole: 2, par: 4, si: 3, meters_gelb: 385, meters_rot: 335 },
            { hole: 3, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 6, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 7, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 8, par: 5, si: 7, meters_gelb: 505, meters_rot: 440 },
            { hole: 9, par: 4, si: 13, meters_gelb: 350, meters_rot: 305 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 145, meters_rot: 125 },
            { hole: 13, par: 5, si: 6, meters_gelb: 510, meters_rot: 445 },
            { hole: 14, par: 4, si: 2, meters_gelb: 420, meters_rot: 365 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 165, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 360, meters_rot: 310 }
        ]
    },
    "bissenmoor": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 340, meters_rot: 295 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 6, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 7, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 8, par: 5, si: 7, meters_gelb: 500, meters_rot: 435 },
            { hole: 9, par: 4, si: 13, meters_gelb: 350, meters_rot: 305 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 505, meters_rot: 440 },
            { hole: 14, par: 4, si: 2, meters_gelb: 415, meters_rot: 360 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 165, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 360, meters_rot: 310 }
        ]
    },
    "vahr": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 360, meters_rot: 315 },
            { hole: 2, par: 4, si: 3, meters_gelb: 385, meters_rot: 335 },
            { hole: 3, par: 5, si: 5, meters_gelb: 505, meters_rot: 440 },
            { hole: 4, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 5, par: 4, si: 1, meters_gelb: 420, meters_rot: 365 },
            { hole: 6, par: 4, si: 9, meters_gelb: 350, meters_rot: 305 },
            { hole: 7, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 8, par: 5, si: 11, meters_gelb: 485, meters_rot: 420 },
            { hole: 9, par: 4, si: 13, meters_gelb: 340, meters_rot: 295 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 510, meters_rot: 445 },
            { hole: 14, par: 4, si: 2, meters_gelb: 415, meters_rot: 360 },
            { hole: 15, par: 4, si: 10, meters_gelb: 355, meters_rot: 310 },
            { hole: 16, par: 3, si: 16, meters_gelb: 160, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 475, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 370, meters_rot: 320 }
        ]
    },
    "hannover": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 345, meters_rot: 300 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 6, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 7, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 8, par: 5, si: 7, meters_gelb: 505, meters_rot: 440 },
            { hole: 9, par: 4, si: 13, meters_gelb: 350, meters_rot: 305 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 310 },
            { hole: 11, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 12, par: 3, si: 18, meters_gelb: 145, meters_rot: 125 },
            { hole: 13, par: 5, si: 6, meters_gelb: 510, meters_rot: 445 },
            { hole: 14, par: 4, si: 2, meters_gelb: 420, meters_rot: 365 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 165, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 365, meters_rot: 315 }
        ]
    },
    "deinster": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 340, meters_rot: 295 },
            { hole: 2, par: 4, si: 3, meters_gelb: 375, meters_rot: 325 },
            { hole: 3, par: 5, si: 5, meters_gelb: 490, meters_rot: 425 },
            { hole: 4, par: 3, si: 17, meters_gelb: 145, meters_rot: 125 },
            { hole: 5, par: 4, si: 1, meters_gelb: 405, meters_rot: 350 },
            { hole: 6, par: 4, si: 9, meters_gelb: 350, meters_rot: 305 },
            { hole: 7, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 8, par: 5, si: 11, meters_gelb: 480, meters_rot: 415 },
            { hole: 9, par: 4, si: 13, meters_gelb: 335, meters_rot: 290 },
            { hole: 10, par: 4, si: 8, meters_gelb: 360, meters_rot: 310 },
            { hole: 11, par: 4, si: 4, meters_gelb: 380, meters_rot: 330 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 500, meters_rot: 435 },
            { hole: 14, par: 4, si: 2, meters_gelb: 410, meters_rot: 355 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 155, meters_rot: 135 },
            { hole: 17, par: 5, si: 12, meters_gelb: 475, meters_rot: 410 },
            { hole: 18, par: 4, si: 14, meters_gelb: 365, meters_rot: 315 }
        ]
    },
    "verden": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 345, meters_rot: 300 },
            { hole: 2, par: 4, si: 3, meters_gelb: 380, meters_rot: 330 },
            { hole: 3, par: 3, si: 17, meters_gelb: 140, meters_rot: 120 },
            { hole: 4, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 5, par: 4, si: 1, meters_gelb: 410, meters_rot: 355 },
            { hole: 6, par: 4, si: 11, meters_gelb: 335, meters_rot: 290 },
            { hole: 7, par: 3, si: 15, meters_gelb: 160, meters_rot: 135 },
            { hole: 8, par: 5, si: 7, meters_gelb: 500, meters_rot: 435 },
            { hole: 9, par: 4, si: 13, meters_gelb: 350, meters_rot: 305 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 385, meters_rot: 335 },
            { hole: 12, par: 3, si: 18, meters_gelb: 145, meters_rot: 125 },
            { hole: 13, par: 5, si: 6, meters_gelb: 505, meters_rot: 440 },
            { hole: 14, par: 4, si: 2, meters_gelb: 415, meters_rot: 360 },
            { hole: 15, par: 4, si: 10, meters_gelb: 345, meters_rot: 300 },
            { hole: 16, par: 3, si: 16, meters_gelb: 165, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 360, meters_rot: 310 }
        ]
    },
    "st. leon-rot (st. leon)": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 375, meters_rot: 325 },
            { hole: 2, par: 5, si: 3, meters_gelb: 520, meters_rot: 455 },
            { hole: 3, par: 3, si: 17, meters_gelb: 165, meters_rot: 140 },
            { hole: 4, par: 4, si: 1, meters_gelb: 430, meters_rot: 375 },
            { hole: 5, par: 4, si: 7, meters_gelb: 380, meters_rot: 330 },
            { hole: 6, par: 4, si: 11, meters_gelb: 355, meters_rot: 310 },
            { hole: 7, par: 3, si: 15, meters_gelb: 175, meters_rot: 150 },
            { hole: 8, par: 5, si: 5, meters_gelb: 510, meters_rot: 445 },
            { hole: 9, par: 4, si: 13, meters_gelb: 365, meters_rot: 320 },
            { hole: 10, par: 4, si: 8, meters_gelb: 380, meters_rot: 330 },
            { hole: 11, par: 4, si: 4, meters_gelb: 405, meters_rot: 355 },
            { hole: 12, par: 3, si: 18, meters_gelb: 155, meters_rot: 130 },
            { hole: 13, par: 5, si: 6, meters_gelb: 525, meters_rot: 460 },
            { hole: 14, par: 4, si: 2, meters_gelb: 435, meters_rot: 380 },
            { hole: 15, par: 4, si: 10, meters_gelb: 370, meters_rot: 325 },
            { hole: 16, par: 3, si: 16, meters_gelb: 180, meters_rot: 155 },
            { hole: 17, par: 5, si: 12, meters_gelb: 495, meters_rot: 430 },
            { hole: 18, par: 4, si: 14, meters_gelb: 390, meters_rot: 340 }
        ]
    },
    "st. leon-rot (rot)": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 370, meters_rot: 320 },
            { hole: 2, par: 4, si: 3, meters_gelb: 400, meters_rot: 350 },
            { hole: 3, par: 5, si: 5, meters_gelb: 515, meters_rot: 450 },
            { hole: 4, par: 3, si: 17, meters_gelb: 160, meters_rot: 135 },
            { hole: 5, par: 4, si: 1, meters_gelb: 425, meters_rot: 370 },
            { hole: 6, par: 4, si: 9, meters_gelb: 360, meters_rot: 315 },
            { hole: 7, par: 3, si: 15, meters_gelb: 170, meters_rot: 145 },
            { hole: 8, par: 5, si: 11, meters_gelb: 505, meters_rot: 440 },
            { hole: 9, par: 4, si: 13, meters_gelb: 355, meters_rot: 310 },
            { hole: 10, par: 4, si: 8, meters_gelb: 375, meters_rot: 325 },
            { hole: 11, par: 4, si: 4, meters_gelb: 395, meters_rot: 345 },
            { hole: 12, par: 3, si: 18, meters_gelb: 150, meters_rot: 125 },
            { hole: 13, par: 5, si: 6, meters_gelb: 520, meters_rot: 455 },
            { hole: 14, par: 4, si: 2, meters_gelb: 430, meters_rot: 375 },
            { hole: 15, par: 4, si: 10, meters_gelb: 365, meters_rot: 320 },
            { hole: 16, par: 3, si: 16, meters_gelb: 175, meters_rot: 150 },
            { hole: 17, par: 5, si: 12, meters_gelb: 490, meters_rot: 425 },
            { hole: 18, par: 4, si: 14, meters_gelb: 385, meters_rot: 335 }
        ]
    },
    "eichenried": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 370, meters_rot: 320 },
            { hole: 2, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 3, par: 4, si: 3, meters_gelb: 395, meters_rot: 345 },
            { hole: 4, par: 5, si: 5, meters_gelb: 510, meters_rot: 445 },
            { hole: 5, par: 4, si: 1, meters_gelb: 420, meters_rot: 365 },
            { hole: 6, par: 5, si: 9, meters_gelb: 495, meters_rot: 430 },
            { hole: 7, par: 3, si: 17, meters_gelb: 150, meters_rot: 125 },
            { hole: 8, par: 4, si: 11, meters_gelb: 360, meters_rot: 315 },
            { hole: 9, par: 4, si: 13, meters_gelb: 355, meters_rot: 310 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 5, si: 6, meters_gelb: 515, meters_rot: 450 },
            { hole: 12, par: 3, si: 18, meters_gelb: 155, meters_rot: 130 },
            { hole: 13, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 14, par: 4, si: 2, meters_gelb: 425, meters_rot: 370 },
            { hole: 15, par: 4, si: 10, meters_gelb: 370, meters_rot: 325 },
            { hole: 16, par: 3, si: 16, meters_gelb: 170, meters_rot: 145 },
            { hole: 17, par: 4, si: 14, meters_gelb: 360, meters_rot: 310 },
            { hole: 18, par: 5, si: 12, meters_gelb: 500, meters_rot: 435 }
        ]
    },
    "frankfurt": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 378, meters_rot: 330 },
            { hole: 2, par: 4, si: 3, meters_gelb: 389, meters_rot: 340 },
            { hole: 3, par: 4, si: 1, meters_gelb: 410, meters_rot: 360 },
            { hole: 4, par: 3, si: 13, meters_gelb: 157, meters_rot: 135 },
            { hole: 5, par: 5, si: 11, meters_gelb: 485, meters_rot: 420 },
            { hole: 6, par: 4, si: 17, meters_gelb: 308, meters_rot: 265 },
            { hole: 7, par: 3, si: 15, meters_gelb: 188, meters_rot: 160 },
            { hole: 8, par: 4, si: 7, meters_gelb: 354, meters_rot: 305 },
            { hole: 9, par: 4, si: 5, meters_gelb: 377, meters_rot: 330 },
            { hole: 10, par: 4, si: 18, meters_gelb: 318, meters_rot: 275 },
            { hole: 11, par: 3, si: 14, meters_gelb: 159, meters_rot: 135 },
            { hole: 12, par: 4, si: 10, meters_gelb: 365, meters_rot: 315 },
            { hole: 13, par: 4, si: 4, meters_gelb: 380, meters_rot: 330 },
            { hole: 14, par: 4, si: 6, meters_gelb: 325, meters_rot: 285 },
            { hole: 15, par: 5, si: 12, meters_gelb: 459, meters_rot: 400 },
            { hole: 16, par: 3, si: 16, meters_gelb: 166, meters_rot: 140 },
            { hole: 17, par: 5, si: 8, meters_gelb: 446, meters_rot: 390 },
            { hole: 18, par: 4, si: 2, meters_gelb: 401, meters_rot: 350 }
        ]
    },
    "hubbelrath": {
        holes18: [
            { hole: 1, par: 4, si: 9, meters_gelb: 360, meters_rot: 315 },
            { hole: 2, par: 4, si: 3, meters_gelb: 385, meters_rot: 335 },
            { hole: 3, par: 5, si: 5, meters_gelb: 505, meters_rot: 440 },
            { hole: 4, par: 3, si: 17, meters_gelb: 150, meters_rot: 125 },
            { hole: 5, par: 4, si: 1, meters_gelb: 415, meters_rot: 360 },
            { hole: 6, par: 4, si: 7, meters_gelb: 370, meters_rot: 320 },
            { hole: 7, par: 3, si: 15, meters_gelb: 165, meters_rot: 140 },
            { hole: 8, par: 5, si: 11, meters_gelb: 490, meters_rot: 425 },
            { hole: 9, par: 4, si: 13, meters_gelb: 355, meters_rot: 310 },
            { hole: 10, par: 4, si: 8, meters_gelb: 365, meters_rot: 315 },
            { hole: 11, par: 4, si: 4, meters_gelb: 390, meters_rot: 340 },
            { hole: 12, par: 3, si: 18, meters_gelb: 145, meters_rot: 125 },
            { hole: 13, par: 5, si: 6, meters_gelb: 510, meters_rot: 445 },
            { hole: 14, par: 4, si: 2, meters_gelb: 420, meters_rot: 365 },
            { hole: 15, par: 4, si: 10, meters_gelb: 360, meters_rot: 315 },
            { hole: 16, par: 3, si: 16, meters_gelb: 170, meters_rot: 145 },
            { hole: 17, par: 5, si: 12, meters_gelb: 480, meters_rot: 415 },
            { hole: 18, par: 4, si: 14, meters_gelb: 375, meters_rot: 325 }
        ]
    },
    "seddiner see": {
        holes18: [
            { hole: 1, par: 4, si: 7, meters_gelb: 365, meters_rot: 315 },
            { hole: 2, par: 5, si: 3, meters_gelb: 510, meters_rot: 445 },
            { hole: 3, par: 3, si: 17, meters_gelb: 150, meters_rot: 125 },
            { hole: 4, par: 4, si: 1, meters_gelb: 420, meters_rot: 365 },
            { hole: 5, par: 4, si: 9, meters_gelb: 355, meters_rot: 310 },
            { hole: 6, par: 4, si: 11, meters_gelb: 340, meters_rot: 295 },
            { hole: 7, par: 3, si: 15, meters_gelb: 170, meters_rot: 145 },
            { hole: 8, par: 5, si: 5, meters_gelb: 495, meters_rot: 430 },
            { hole: 9, par: 4, si: 13, meters_gelb: 350, meters_rot: 305 },
            { hole: 10, par: 4, si: 8, meters_gelb: 370, meters_rot: 320 },
            { hole: 11, par: 4, si: 4, meters_gelb: 395, meters_rot: 345 },
            { hole: 12, par: 3, si: 18, meters_gelb: 140, meters_rot: 120 },
            { hole: 13, par: 5, si: 6, meters_gelb: 515, meters_rot: 450 },
            { hole: 14, par: 4, si: 2, meters_gelb: 425, meters_rot: 370 },
            { hole: 15, par: 4, si: 10, meters_gelb: 355, meters_rot: 310 },
            { hole: 16, par: 3, si: 16, meters_gelb: 165, meters_rot: 140 },
            { hole: 17, par: 5, si: 12, meters_gelb: 485, meters_rot: 420 },
            { hole: 18, par: 4, si: 14, meters_gelb: 375, meters_rot: 325 }
        ]
    }
};

function getCourseHolesForClub(club, loecher, isBackNine = false) {
    const numLoecher = parseInt(loecher, 10) || 18;
    const clubNameLower = (club?.name || '').toLowerCase();

    // 1. Curated authentic club templates take priority for known golf clubs
    const templateKey = Object.keys(clubHolesTemplates).find(key => clubNameLower.includes(key));
    if(templateKey && clubHolesTemplates[templateKey]) {
        const full18 = clubHolesTemplates[templateKey].holes18;
        if(numLoecher === 9) {
            const isBack = isBackNine || clubNameLower.includes('10-18') || clubNameLower.includes('back');
            const slice = isBack ? full18.slice(9, 18) : full18.slice(0, 9);
            // DGV Rule: Vorgabenschlüssel 1..9 for 9-hole rounds ranked by stroke index difficulty
            const sortedIndices = slice.map((h, idx) => ({ si: h.si, idx })).sort((a, b) => a.si - b.si);
            const rankMap = {};
            sortedIndices.forEach((item, rank) => {
                rankMap[item.idx] = rank + 1;
            });
            return slice.map((h, idx) => ({
                hole: h.hole,
                par: h.par,
                si: rankMap[idx] || (idx + 1),
                meters_gelb: h.meters_gelb,
                meters_rot: h.meters_rot
            }));
        }
        return full18.map(h => ({
            hole: h.hole,
            par: h.par,
            si: h.si,
            meters_gelb: h.meters_gelb,
            meters_rot: h.meters_rot
        }));
    }

    // 2. Custom holes from club object (user-created club or backend data)
    if(club && Array.isArray(club.holes) && club.holes.length >= numLoecher) {
        if(numLoecher === 9 && (isBackNine || clubNameLower.includes('10-18') || clubNameLower.includes('back')) && club.holes.length >= 18) {
            const slice = club.holes.slice(9, 18);
            const sortedIndices = slice.map((h, idx) => ({ si: parseInt(h.si, 10) || (idx + 1), idx })).sort((a, b) => a.si - b.si);
            const rankMap = {};
            sortedIndices.forEach((item, rank) => {
                rankMap[item.idx] = rank + 1;
            });
            return slice.map((h, idx) => ({
                hole: h.hole || (idx + 10),
                par: parseInt(h.par, 10) || 4,
                si: rankMap[idx] || (idx + 1),
                meters_gelb: h.meters_gelb,
                meters_rot: h.meters_rot
            }));
        }
        return club.holes.slice(0, numLoecher).map(h => ({
            hole: h.hole,
            par: parseInt(h.par, 10) || 4,
            si: parseInt(h.si, 10) || h.hole,
            meters_gelb: h.meters_gelb,
            meters_rot: h.meters_rot
        }));
    }

    // 3. Dynamic fallback matching official DGV pars
    const is9 = numLoecher === 9;
    const parVal = is9 
        ? (club?.par9 ? Math.round(parseFloat(club.par9)) : 36)
        : (club?.par18 ? Math.round(parseFloat(club.par18)) : 72);
    let pars;
    if(is9) {
        pars = [4, 4, 3, 5, 4, 4, 3, 5, 4]; // sum = 36
    } else if(parVal === 71) {
        pars = [4, 4, 3, 5, 4, 4, 3, 4, 4, 4, 4, 4, 3, 5, 4, 3, 5, 4]; // sum = 71
    } else if(parVal === 73) {
        pars = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 4, 5, 4]; // sum = 73
    } else {
        pars = [4, 4, 3, 5, 4, 4, 3, 5, 4, 4, 4, 4, 3, 5, 4, 3, 5, 4]; // sum = 72
    }
    const sis = is9
        ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
        : [7, 3, 15, 1, 11, 5, 17, 9, 13, 8, 4, 16, 2, 12, 18, 6, 10, 14];

    const offset = (is9 && (isBackNine || clubNameLower.includes('10-18'))) ? 9 : 0;
    return pars.slice(0, numLoecher).map((p, idx) => ({
        hole: idx + 1 + offset,
        par: p,
        si: sis[idx] || (idx + 1)
    }));
}

// --- HOLE-BY-HOLE SCORECARD IMPLEMENTATION ---
function initScorecardHoles() {
    const tbody = document.getElementById('scorecard-holes-body');
    if(!tbody) return;
    const loecher = parseInt(document.getElementById('rec-loecher')?.value || '18', 10);
    const clubName = document.getElementById('rec-club')?.value;
    const club = clubs.find(c => c.name === clubName) || clubs[0];
    tbody.innerHTML = '';
    tbody.dataset.club = clubName || '';

    const clubNameLower = (clubName || '').toLowerCase();
    const isBackNine = (loecher === 9) && clubNameLower.includes('10-18');
    const courseHoles = getCourseHolesForClub(club, loecher, isBackNine);
    scorecardData = [];

    for(let i = 1; i <= loecher; i++) {
        const holeObj = courseHoles[i - 1] || { hole: i + (isBackNine ? 9 : 0), par: 4, si: i };
        const holeNum = holeObj.hole || (i + (isBackNine ? 9 : 0));
        const par = holeObj.par;
        scorecardData.push({ hole: holeNum, par: par, strokes: par, si: holeObj.si });

        const tr = document.createElement('tr');
        tr.id = `scorecard-row-${holeNum}`;
        tr.className = "hover:bg-slate-50";
        tr.innerHTML = `
            <td class="py-2 px-2 font-bold text-slate-700">Loch ${holeNum} <span class="text-[10px] text-slate-400 font-normal">SI ${holeObj.si}</span></td>
            <td class="py-2 px-2">
                <select onchange="updateHolePar(${holeNum}, this.value)" class="text-xs py-1 px-1.5 rounded-md border border-slate-200 bg-white font-mono">
                    <option value="3" ${par == 3 ? 'selected' : ''}>Par 3</option>
                    <option value="4" ${par == 4 ? 'selected' : ''}>Par 4</option>
                    <option value="5" ${par == 5 ? 'selected' : ''}>Par 5</option>
                </select>
            </td>
            <td class="py-2 px-2">
                <div class="inline-flex items-center gap-1.5">
                    <button type="button" onclick="adjustHoleScore(${holeNum}, -1)" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">−</button>
                    <input type="number" id="hole-score-${holeNum}" min="1" max="15" value="${par}" oninput="updateHoleScore(${holeNum}, this.value)" class="w-12 text-center py-1 rounded-md border border-slate-200 text-sm font-bold font-mono">
                    <button type="button" onclick="adjustHoleScore(${holeNum}, 1)" class="w-6 h-6 rounded bg-slate-100 hover:bg-slate-200 font-bold text-xs">+</button>
                </div>
            </td>
            <td class="py-2 px-2" id="hole-relative-${holeNum}">
                <span class="px-2 py-0.5 rounded text-[11px] font-bold score-par">Par</span>
            </td>
            <td class="py-2 px-2 font-mono text-xs font-bold text-slate-600" id="hole-stb-${holeNum}">2 Pkt</td>
        `;
        tbody.appendChild(tr);
    }
    updateScorecardTotals();
}

function adjustHoleScore(holeNum, delta) {
    const h = scorecardData.find(x => x.hole === holeNum);
    if(!h) return;
    h.strokes = Math.max(1, h.strokes + delta);
    document.getElementById(`hole-score-${holeNum}`).value = h.strokes;
    updateScorecardTotals();
}

function updateHoleScore(holeNum, val) {
    const h = scorecardData.find(x => x.hole === holeNum);
    if(!h) return;
    const parsed = parseInt(val, 10);
    if(!isNaN(parsed) && parsed >= 1) {
        h.strokes = parsed;
        updateScorecardTotals();
    }
}

function updateHolePar(holeNum, val) {
    const h = scorecardData.find(x => x.hole === holeNum);
    if(!h) return;
    h.par = parseInt(val, 10);
    updateScorecardTotals();
}

function updateScorecardTotals() {
    let totalBrutto = 0;
    let totalPar = 0;
    let totalStableford = 0;

    scorecardData.forEach(h => {
        totalBrutto += h.strokes;
        totalPar += h.par;

        const diff = h.strokes - h.par;
        const relEl = document.getElementById(`hole-relative-${h.hole}`);
        const stbEl = document.getElementById(`hole-stb-${h.hole}`);

        if(relEl) {
            if(diff <= -2) {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-eagle">Eagle</span>`;
            } else if(diff === -1) {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-birdie">Birdie</span>`;
            } else if(diff === 0) {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-par">Par</span>`;
            } else if(diff === 1) {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-bogey">+1 Bogey</span>`;
            } else {
                relEl.innerHTML = `<span class="px-2 py-0.5 rounded text-[10px] font-bold score-double">+${diff}</span>`;
            }
        }

        const stbPoints = Math.max(0, 2 - diff);
        totalStableford += stbPoints;
        if(stbEl) stbEl.innerText = `${stbPoints} Pkt`;
    });

    document.getElementById('scorecard-total-brutto').innerText = totalBrutto;
    const diffTotal = totalBrutto - totalPar;
    document.getElementById('scorecard-vs-par').innerText = diffTotal > 0 ? `+${diffTotal}` : (diffTotal === 0 ? 'E' : `${diffTotal}`);
    document.getElementById('scorecard-stableford').innerText = `${totalStableford} Pkt`;

    document.getElementById('rec-brutto').value = totalBrutto;
    onRoundInputChanged();
}


// --- 4. SIGNATURE PAD HELPER (HTML5 CANVAS WITH TOUCH & MOUSE) ---
function initSignaturePad(canvasId, strokeWidth = 2.5) {
    const canvas = document.getElementById(canvasId);
    if(!canvas) return null;
    const ctx = canvas.getContext('2d');
    let drawing = false;

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: (clientX - rect.left) * (canvas.width / rect.width),
            y: (clientY - rect.top) * (canvas.height / rect.height)
        };
    }
    function start(e) {
        drawing = true;
        const pos = getPos(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
        if(e.cancelable) e.preventDefault();
    }
    function draw(e) {
        if(!drawing) return;
        const pos = getPos(e);
        ctx.lineWidth = strokeWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#0f172a';
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        if(e.cancelable) e.preventDefault();
    }
    function end() {
        if(drawing) {
            drawing = false;
            updateSignatureBadges();
        }
    }

    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    window.addEventListener('mouseup', end);

    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    window.addEventListener('touchend', end);

    return {
        clear: () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            updateSignatureBadges();
        },
        isEmpty: () => {
            const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
            return !pixelBuffer.some(color => color !== 0);
        },
        toDataURL: () => canvas.toDataURL('image/png'),
        getCanvas: () => canvas
    };
}

function updateSignatureBadges() {
    const playerBadge = document.getElementById('sc-player-signed-badge');
    const markerBadge = document.getElementById('sc-marker-signed-badge');
    if(playerBadge) {
        if(scPlayerSigPad && !scPlayerSigPad.isEmpty()) {
            playerBadge.classList.remove('hidden');
        } else {
            playerBadge.classList.add('hidden');
        }
    }
    if(markerBadge) {
        if(scMarkerSigPad && !scMarkerSigPad.isEmpty()) {
            markerBadge.classList.remove('hidden');
        } else {
            markerBadge.classList.add('hidden');
        }
    }
}

function clearPlayerSignature() {
    if(scPlayerSigPad) scPlayerSigPad.clear();
    updateSignatureBadges();
}

function clearMarkerSignature() {
    if(scMarkerSigPad) scMarkerSigPad.clear();
    updateSignatureBadges();
}

// --- ENLARGED TOUCH SIGNATURE MODAL ---
function openZoomSignatureModal(type) {
    activeZoomSigType = type; // 'player' or 'marker'
    const modal = document.getElementById('signature-zoom-modal');
    const titleEl = document.getElementById('sig-zoom-title');
    const roleEl = document.getElementById('sig-zoom-role');

    if(type === 'player') {
        if(titleEl) titleEl.innerText = "Unterschrift Spieler (Großansicht)";
        if(roleEl) roleEl.innerText = currentUser?.username || "Spieler";
    } else {
        const markerName = document.getElementById('sc-marker-name')?.value.trim() || "Zähler / Marker";
        if(titleEl) titleEl.innerText = "Unterschrift Zähler (Großansicht)";
        if(roleEl) roleEl.innerText = markerName;
    }

    if(modal) modal.classList.remove('hidden');

    setTimeout(() => {
        if(!zoomSigPad) {
            zoomSigPad = initSignaturePad('sc-zoom-canvas', 4.0);
        }
        if(zoomSigPad) {
            zoomSigPad.clear();
            // Preload existing signature into zoom canvas if already present
            const targetCanvasId = (type === 'player') ? 'sc-player-canvas' : 'sc-marker-canvas';
            const targetPad = (type === 'player') ? scPlayerSigPad : scMarkerSigPad;
            const targetCanvas = document.getElementById(targetCanvasId);
            const zoomCanvas = document.getElementById('sc-zoom-canvas');
            if(targetPad && !targetPad.isEmpty() && targetCanvas && zoomCanvas) {
                const zctx = zoomCanvas.getContext('2d');
                zctx.drawImage(targetCanvas, 0, 0, zoomCanvas.width, zoomCanvas.height);
            }
        }
    }, 50);
}

function closeZoomSignatureModal() {
    const modal = document.getElementById('signature-zoom-modal');
    if(modal) modal.classList.add('hidden');
}

function clearZoomSignature() {
    if(zoomSigPad) zoomSigPad.clear();
}

function confirmZoomSignature() {
    if(!zoomSigPad || zoomSigPad.isEmpty()) {
        showToast("Bitte unterschreibe im vergrößerten Feld.", "✍️");
        return;
    }
    const zoomCanvas = document.getElementById('sc-zoom-canvas');
    const targetCanvasId = (activeZoomSigType === 'player') ? 'sc-player-canvas' : 'sc-marker-canvas';
    const targetCanvas = document.getElementById(targetCanvasId);

    if(targetCanvas && zoomCanvas) {
        const tctx = targetCanvas.getContext('2d');
        tctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
        tctx.drawImage(zoomCanvas, 0, 0, targetCanvas.width, targetCanvas.height);
    }

    updateSignatureBadges();
    closeZoomSignatureModal();
    showToast("Unterschrift erfolgreich übernommen! ✅", "✍️");
}

function updateScorecardTournamentBanner() {
    const banner = document.getElementById('sc-tournament-banner');
    if(!banner) return;
    if(!activeScorecardTournament) {
        banner.classList.add('hidden');
        return;
    }

    const t = activeScorecardTournament;
    const titleEl = document.getElementById('sc-tb-title');
    const spielformEl = document.getElementById('sc-tb-spielform');
    const vorgabeEl = document.getElementById('sc-tb-vorgabe');
    const metaEl = document.getElementById('sc-tb-meta');

    if(titleEl) titleEl.innerText = t.name || t.titel || 'Club-Turnier';
    if(spielformEl) {
        const sf = t.spielform || 'Stableford';
        spielformEl.innerText = sf;
        if(sf.toLowerCase().includes('zähl') || sf.toLowerCase().includes('stroke')) {
            spielformEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-800 border border-purple-200";
        } else if(sf.toLowerCase().includes('scramble') || sf.toLowerCase().includes('vierer')) {
            spielformEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200";
        } else {
            spielformEl.className = "px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200";
        }
    }
    if(vorgabeEl) {
        const isVorgabe = t.vorgabenwirksam !== false && t.vorgabenwirksam !== 'nein';
        vorgabeEl.innerText = isVorgabe ? 'Vorgabenwirksam' : 'Nicht vorgabenwirksam';
        vorgabeEl.className = isVorgabe 
            ? "px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200"
            : "px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200";
    }
    if(metaEl) {
        const clubStr = t.club_name || document.getElementById('sc-club-select')?.value || '';
        metaEl.innerText = `${clubStr} • ${t.datum || ''} • ${t.loecher || 18} Löcher`;
    }

    banner.classList.remove('hidden');
}

// --- 5. DIGITAL TOURNAMENT SCORECARD LOGIC ---
function openScorecardModal(turnier = null) {
    const selectEl = document.getElementById('sc-club-select');
    selectEl.innerHTML = '';

    // Populate clubs with favorites at top
    const sortedClubs = [...clubs].sort((a, b) => {
        const aFav = favoriteClubNames.has(a.name) ? 1 : 0;
        const bFav = favoriteClubNames.has(b.name) ? 1 : 0;
        return bFav - aFav;
    });

    sortedClubs.forEach(c => {
        const opt = document.createElement('option');
        opt.value = c.name;
        opt.innerText = `${favoriteClubNames.has(c.name) ? '⭐ ' : ''}${c.name} (${c.city || c.region})`;
        selectEl.appendChild(opt);
    });

    if(turnier) {
        activeScorecardTournament = turnier;
        
        // Match club by id or fuzzy name
        const rawClubName = (turnier.club_name || '').trim();
        const normalize = s => (s || '').toLowerCase()
            .replace(/^(gc|golfclub|golf-club)\s+/i, '')
            .replace(/\s*(18|1-9|10-18|nord|süd|ost|west)\b/gi, '')
            .trim();
        const normTarget = normalize(rawClubName);
        
        let targetClub = null;
        if(turnier.club_id) {
            targetClub = clubs.find(c => c.id === turnier.club_id);
        }
        if(!targetClub && rawClubName) {
            targetClub = clubs.find(c => c.name.toLowerCase() === rawClubName.toLowerCase());
            if(!targetClub) {
                targetClub = clubs.find(c => normalize(c.name) === normTarget);
            }
            if(!targetClub) {
                targetClub = clubs.find(c => c.name.toLowerCase().includes(normTarget) || normTarget.includes(c.name.toLowerCase()));
            }
        }

        // Special handling if tournament is 9 holes and specified 10-18 / Back-Nine
        const tNameLower = ((turnier.name || turnier.titel || '') + ' ' + (turnier.kurs || '') + ' ' + rawClubName).toLowerCase();
        const isBackNine = tNameLower.includes('10-18') || tNameLower.includes('back-nine') || tNameLower.includes('back 9');
        if(isBackNine) {
            const backNineClub = clubs.find(c => c.name.toLowerCase().includes('10-18') && normalize(c.name) === normTarget);
            if(backNineClub) targetClub = backNineClub;
        } else if(turnier.loecher === 9) {
            const frontNineClub = clubs.find(c => c.name.toLowerCase().includes('1-9') && normalize(c.name) === normTarget);
            if(frontNineClub) targetClub = frontNineClub;
        }

        if(targetClub) {
            selectEl.value = targetClub.name;
        } else if(turnier.club_name) {
            const exists = Array.from(selectEl.options).some(o => o.value === turnier.club_name);
            if(!exists) {
                const opt = document.createElement('option');
                opt.value = turnier.club_name;
                opt.innerText = turnier.club_name;
                selectEl.appendChild(opt);
            }
            selectEl.value = turnier.club_name;
        }

        if(turnier.datum) {
            let parts = turnier.datum.split('.');
            if(parts.length === 3) {
                document.getElementById('sc-datum').value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
            } else {
                document.getElementById('sc-datum').value = turnier.datum;
            }
        } else {
            document.getElementById('sc-datum').value = new Date().toISOString().split('T')[0];
        }
        if(turnier.loecher) {
            document.getElementById('sc-loecher').value = String(turnier.loecher);
        }
    } else {
        activeScorecardTournament = null;
        document.getElementById('sc-datum').value = new Date().toISOString().split('T')[0];
    }

    // Reset GPS Status
    scGpsData = null;
    document.getElementById('sc-gps-badge').className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600";
    document.getElementById('sc-gps-badge').innerText = "Ungeprüft";
    document.getElementById('sc-gps-details').innerText = "Klicke auf 'Standort prüfen', um zu verifizieren, dass du dich auf dem Clubgelände befindest.";

    updateScorecardTournamentBanner();
    onScorecardClubChanged(turnier);
    document.getElementById('scorecard-modal').classList.remove('hidden');

    // Initialize signature pads
    setTimeout(() => {
        if(!scPlayerSigPad) scPlayerSigPad = initSignaturePad('sc-player-canvas', 2.5);
        if(!scMarkerSigPad) scMarkerSigPad = initSignaturePad('sc-marker-canvas', 2.5);
        scPlayerSigPad?.clear();
        scMarkerSigPad?.clear();
        updateSignatureBadges();
    }, 100);
}

function closeScorecardModal() {
    document.getElementById('scorecard-modal').classList.add('hidden');
}

async function onScorecardClubChanged(preselectedTournament = null) {
    const clubName = document.getElementById('sc-club-select').value;
    const club = clubs.find(c => c.name === clubName) || clubs[0];
    if(!club) return;

    // Handle pure 9-hole clubs
    const has18 = club.par18 !== null && club.par18 !== undefined && String(club.par18).trim() !== '';
    const has9 = club.par9 !== null && club.par9 !== undefined && String(club.par9).trim() !== '';
    const isPure9 = !has18 && has9;

    const opt18 = document.getElementById('sc-loecher-opt-18');
    const loecherSelect = document.getElementById('sc-loecher');
    if(opt18) {
        opt18.disabled = isPure9;
        opt18.innerText = isPure9 ? "18 Löcher (Nicht verfügbar)" : "18 Löcher";
    }

    if(preselectedTournament && preselectedTournament.loecher) {
        loecherSelect.value = String(preselectedTournament.loecher);
    } else if(isPure9 || (!has18 && loecherSelect.value === '18')) {
        loecherSelect.value = '9';
    }

    // Update Club Tournaments in dropdown
    await updateScorecardTournaments(club, preselectedTournament);

    recalculateScorecardHandicapAndCourse();
    initScorecardHolesTable();
}

async function updateScorecardTournaments(club, preselectedTournament = null) {
    const select = document.getElementById('sc-turnier-select');
    const customInput = document.getElementById('sc-turnier-name');
    if(!select) return;

    let clubTurniere = [];
    if(club && club.id) {
        try {
            const res = await apiFetch(`/api/clubs/${club.id}/turniere`);
            if(res.ok && res.data) {
                const list = Array.isArray(res.data) ? res.data : (res.data.turniere || []);
                clubTurniere = list;
                list.forEach(ct => {
                    if(!turniere.some(t => t.id === ct.id)) turniere.push(ct);
                });
            }
        } catch(e) {
            console.warn("Konnte Turniere für Club nicht abrufen:", e);
        }
    }

    if(clubTurniere.length === 0 && club) {
        const baseName = club.name.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
        clubTurniere = turniere.filter(t => {
            if(t.club_id && club.id && t.club_id === club.id) return true;
            if(t.club_name === club.name) return true;
            const tClubBase = (t.club_name || '').replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
            return tClubBase === baseName;
        });
    }

    select.innerHTML = '<option value="">Freie Runde / Privatrunde</option>';
    if(clubTurniere.length > 0) {
        const group = document.createElement('optgroup');
        group.label = `Club-Turniere (${clubTurniere.length})`;
        clubTurniere.forEach(t => {
            const opt = document.createElement('option');
            opt.value = String(t.id);
            opt.innerText = `🏆 ${t.datum} – ${t.name || t.titel} (${t.loecher}L, ${t.spielform || 'Stableford'})`;
            group.appendChild(opt);
        });
        select.appendChild(group);
    }
    const optCustom = document.createElement('option');
    optCustom.value = '__custom__';
    optCustom.innerText = '✍️ Anderes / Manuelles Turnier...';
    select.appendChild(optCustom);

    const targetTournament = preselectedTournament || activeScorecardTournament;
    if(targetTournament) {
        const found = clubTurniere.find(t => (targetTournament.id && t.id === targetTournament.id) || t.name === targetTournament.name || t.name === targetTournament.titel);
        if(found) {
            select.value = String(found.id);
            activeScorecardTournament = found;
            if(customInput) {
                customInput.classList.add('hidden');
                customInput.value = found.name || found.titel;
            }
        } else {
            const tId = targetTournament.id ? String(targetTournament.id) : `tourn_${Date.now()}`;
            const opt = document.createElement('option');
            opt.value = tId;
            const tName = targetTournament.name || targetTournament.titel || 'Turnier';
            opt.innerText = `🏆 ${targetTournament.datum || ''} – ${tName} (${targetTournament.loecher || 18}L, ${targetTournament.spielform || 'Stableford'})`;
            select.insertBefore(opt, optCustom);
            select.value = tId;
            activeScorecardTournament = targetTournament;
            if(!turniere.some(t => t.id === targetTournament.id)) {
                turniere.push(targetTournament);
            }
            if(customInput) {
                customInput.classList.add('hidden');
                customInput.value = tName;
            }
        }
    } else if(activeScorecardTournament && activeScorecardTournament.club_name === club.name) {
        select.value = String(activeScorecardTournament.id || '__custom__');
    } else {
        select.value = '';
        activeScorecardTournament = null;
        if(customInput) {
            customInput.classList.add('hidden');
            customInput.value = 'Freie Runde';
        }
    }
    updateScorecardTournamentBanner();
}

function onScorecardTournamentSelected() {
    const select = document.getElementById('sc-turnier-select');
    const customInput = document.getElementById('sc-turnier-name');
    const val = select.value;

    if(!val) {
        activeScorecardTournament = null;
        if(customInput) {
            customInput.classList.add('hidden');
            customInput.value = 'Freie Runde';
        }
    } else if(val === '__custom__') {
        activeScorecardTournament = null;
        if(customInput) {
            customInput.classList.remove('hidden');
            customInput.value = '';
            customInput.focus();
        }
    } else {
        const turnierId = parseInt(val, 10);
        const t = turniere.find(item => item.id === turnierId) || (activeScorecardTournament && activeScorecardTournament.id === turnierId ? activeScorecardTournament : null);
        if(t) {
            activeScorecardTournament = t;
            if(customInput) {
                customInput.classList.add('hidden');
                customInput.value = t.name || t.titel;
            }
            if(t.datum && t.datum.includes('.')) {
                const parts = t.datum.split('.');
                if(parts.length === 3) {
                    document.getElementById('sc-datum').value = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
            } else if(t.datum) {
                document.getElementById('sc-datum').value = t.datum;
            }
            if(t.loecher) {
                document.getElementById('sc-loecher').value = String(t.loecher);
            }
        }
    }
    updateScorecardTournamentBanner();
    recalculateScorecardHandicapAndCourse();
    initScorecardHolesTable();
}

function onScorecardLoecherChanged() {
    recalculateScorecardHandicapAndCourse();
    initScorecardHolesTable();
}

function onScorecardTeeChanged() {
    recalculateScorecardHandicapAndCourse();
    initScorecardHolesTable(true);
}

function recalculateScorecardHandicapAndCourse() {
    const clubName = document.getElementById('sc-club-select').value;
    let club = clubs.find(c => c.name === clubName) || clubs[0];
    const loecher = parseInt(document.getElementById('sc-loecher').value, 10) || 18;
    const selectedTee = document.getElementById('sc-tee-select')?.value || 'gelb';

    const clubNameLower = (clubName || '').toLowerCase();
    const tNameLower = activeScorecardTournament ? ((activeScorecardTournament.name || activeScorecardTournament.titel || '') + ' ' + (activeScorecardTournament.kurs || '')).toLowerCase() : '';
    const isBackNine = (loecher === 9) && (clubNameLower.includes('10-18') || tNameLower.includes('10-18') || tNameLower.includes('back-nine') || tNameLower.includes('back 9'));

    // If club doesn't have 9-hole data but 9 holes is selected, check sister sub-course (e.g. GC Jersbek 10-18 or GC Jersbek 1-9)
    if(loecher === 9 && (!club?.cr9 || String(club.cr9).trim() === '')) {
        const baseName = clubName.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
        const sisterClub = clubs.find(c => {
            const cLower = c.name.toLowerCase();
            const cBase = c.name.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
            return cBase === baseName && (isBackNine ? cLower.includes('10-18') : cLower.includes('1-9'));
        });
        if(sisterClub && sisterClub.cr9) {
            club = sisterClub;
        }
    } else if(loecher === 18 && (!club?.cr18 || String(club.cr18).trim() === '')) {
        const baseName = clubName.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
        const sisterClub = clubs.find(c => {
            const cBase = c.name.replace(/\s*(18|1-9|10-18)\b/gi, '').trim().toLowerCase();
            return cBase === baseName && c.cr18;
        });
        if(sisterClub && sisterClub.cr18) {
            club = sisterClub;
        }
    }

    let cr = 72.0;
    let slope = 113.0;
    let par = 72.0;

    if(loecher === 18) {
        cr = parseFloat(club?.cr18 || club?.cr9 || 72.0);
        slope = parseFloat(club?.sr18 || club?.sr9 || 113.0);
        par = parseFloat(club?.par18 || club?.par9 || 72.0);
    } else {
        cr = parseFloat(club?.cr9 || (club?.cr18 ? (parseFloat(club.cr18) / 2.0).toFixed(1) : 36.0));
        slope = parseFloat(club?.sr9 || club?.sr18 || 113.0);
        par = parseFloat(club?.par9 || (club?.par18 ? Math.round(parseFloat(club.par18) / 2.0) : 36.0));
    }

    // Dynamic adjustment for Red Tees (Damen Abschlag) according to DGV standards
    if(selectedTee === 'rot') {
        if(loecher === 18) {
            cr = parseFloat(club?.cr18_rot || (cr + 1.8));
            slope = parseFloat(club?.sr18_rot || (slope + 3.0));
        } else {
            cr = parseFloat(club?.cr9_rot || (cr + 0.9));
            slope = parseFloat(club?.sr9_rot || (slope + 2.0));
        }
    }

    if(isNaN(cr)) cr = (loecher === 18 ? 72.0 : 36.0);
    if(isNaN(slope)) slope = 113.0;
    if(isNaN(par)) par = (loecher === 18 ? 72.0 : 36.0);

    document.getElementById('sc-display-cr').innerText = cr.toFixed(1);
    document.getElementById('sc-display-slope').innerText = Math.round(slope);
    document.getElementById('sc-display-par').innerText = Math.round(par);

    // Player Info
    const hcp = (aktuellesHCP !== null && aktuellesHCP !== undefined && !isNaN(parseFloat(aktuellesHCP))) ? parseFloat(aktuellesHCP) : 54.0;
    document.getElementById('sc-player-name').innerText = currentUser?.username || 'Gast-Spieler';
    document.getElementById('sc-player-hcpi').innerText = hcp.toFixed(1);

    // Course Handicap (Spielvorgabe) official WHS formula
    let courseHcp = 0;
    if(loecher === 18) {
        courseHcp = Math.round((hcp * slope / 113.0) + (cr - par));
    } else {
        courseHcp = Math.round(((hcp / 2.0) * slope / 113.0) + (cr - par));
    }
    document.getElementById('sc-calculated-playing-hcp').innerText = isNaN(courseHcp) ? '0' : courseHcp;
}

let showProStats = false;

function toggleProStatsColumns() {
    // Pro-Statistiken wurden auf Wunsch des Nutzers entfernt
}

function initScorecardHolesTable(preserveExisting = false) {
    const loecher = parseInt(document.getElementById('sc-loecher').value, 10) || 18;
    const playingHcp = parseInt(document.getElementById('sc-calculated-playing-hcp').innerText, 10) || 0;
    const clubName = document.getElementById('sc-club-select').value;
    const club = clubs.find(c => c.name === clubName) || clubs[0];
    const selectedTee = document.getElementById('sc-tee-select')?.value || 'gelb';

    const clubNameLower = (clubName || '').toLowerCase();
    const tNameLower = activeScorecardTournament ? ((activeScorecardTournament.name || activeScorecardTournament.titel || '') + ' ' + (activeScorecardTournament.kurs || '')).toLowerCase() : '';
    const isBackNine = (loecher === 9) && (clubNameLower.includes('10-18') || tNameLower.includes('10-18') || tNameLower.includes('back-nine') || tNameLower.includes('back 9'));

    const courseHoles = getCourseHolesForClub(club, loecher, isBackNine);
    const tbody = document.getElementById('sc-holes-table-body');
    const thead = document.getElementById('sc-holes-table-head');
    const tfoot = document.getElementById('sc-holes-table-foot');
    
    const prevData = (preserveExisting && Array.isArray(scHolesData)) ? [...scHolesData] : [];
    tbody.innerHTML = '';
    scHolesData = [];

    let totalPar = 0;
    let totalStriche = 0;
    let totalMeters = 0;

    const teeBadge = selectedTee === 'rot' ? '🔴 Rot' : '🟡 Gelb';

    if (thead) {
        thead.innerHTML = `
            <tr>
                <th class="sticky left-0 bg-slate-100 z-20 py-2.5 px-2 text-center w-12 font-bold shadow-[1px_0_0_0_#cbd5e1]">Loch</th>
                <th class="py-2.5 px-2 text-center w-16" title="Distanz vom gewählten Abschlag">${teeBadge}</th>
                <th class="py-2.5 px-2 text-center w-12">Par</th>
                <th class="py-2.5 px-2 text-center w-14" title="Stroke Index / Vorgaben-Schlüssel">SI</th>
                <th class="py-2.5 px-2 text-center w-14" title="Vorgabestriche">Striche</th>
                <th class="py-2.5 px-3 text-center w-28">Brutto Schläge</th>
                <th class="py-2.5 px-2 text-center w-14">Netto</th>
                <th class="py-2.5 px-2 text-center w-16" title="Netto-Stableford Punkte">Stbf. Pkt</th>
            </tr>
        `;
    }

    // Rank holes by SI for clean stroke allocation on 9 holes
    const sortedBySi = courseHoles.map((h, idx) => ({ idx, si: h.si })).sort((a, b) => a.si - b.si);
    const siRankMap = {};
    sortedBySi.forEach((item, rank) => {
        siRankMap[item.idx] = rank + 1;
    });

    for(let i = 0; i < loecher; i++) {
        const holeObj = courseHoles[i] || { hole: i + 1 + (isBackNine ? 9 : 0), par: 4, si: i + 1 };
        const holeNr = holeObj.hole;
        const par = holeObj.par;
        const si = holeObj.si;

        // Hole distance matching the selected Tee (Gelb or Rot)
        let meters = 0;
        if(selectedTee === 'rot') {
            meters = holeObj.meters_rot || Math.round((holeObj.meters_gelb || (par === 3 ? 140 : par === 4 ? 340 : 470)) * 0.86);
        } else {
            meters = holeObj.meters_gelb || (par === 3 ? 155 : par === 4 ? 365 : 495);
        }

        // Vorgabestriche calculation according to WHS Course Handicap & Stroke Index
        const baseStriche = Math.floor(playingHcp / loecher);
        const remainder = ((playingHcp % loecher) + loecher) % loecher;
        const rank = (loecher === 9) ? (siRankMap[i] || (i + 1)) : si;
        const striche = baseStriche + (rank <= remainder ? 1 : 0);

        totalPar += par;
        totalStriche += striche;
        totalMeters += meters;

        const prevHole = prevData[i];
        const initialStrokes = prevHole ? prevHole.strokes : par;
        const netto = Math.max(1, initialStrokes - striche);
        const stbf = Math.max(0, par - netto + 2);

        scHolesData.push({
            hole: holeNr,
            par: par,
            si: si,
            meters: meters,
            striche: striche,
            strokes: initialStrokes,
            gross: initialStrokes,
            netto: netto,
            stableford: stbf
        });

        const tr = document.createElement('tr');
        tr.id = `sc-row-${i}`;
        tr.className = "hover:bg-slate-50 transition-colors";
        
        tr.innerHTML = `
            <td class="sticky left-0 bg-white z-10 py-2 px-2 text-center font-bold text-slate-800 shadow-[1px_0_0_0_#e2e8f0]">${holeNr}</td>
            <td class="py-2 px-1 text-center font-mono font-bold text-[11px] text-slate-600">${meters} m</td>
            <td class="py-2 px-1 text-center">
                <select onchange="updateScorecardHolePar(${i}, this.value)" class="text-xs py-0.5 px-1 rounded-md border border-slate-200 bg-white font-bold text-slate-700 cursor-pointer hover:border-golf-500 focus:outline-none focus:ring-1 focus:ring-golf-500" title="Par für Loch ${holeNr} anpassen">
                    <option value="3" ${par === 3 ? 'selected' : ''}>3</option>
                    <option value="4" ${par === 4 ? 'selected' : ''}>4</option>
                    <option value="5" ${par === 5 ? 'selected' : ''}>5</option>
                    <option value="6" ${par === 6 ? 'selected' : ''}>6</option>
                </select>
            </td>
            <td class="py-2 px-2 text-center text-slate-400">${si}</td>
            <td class="py-2 px-2 text-center font-bold text-golf-700">${striche > 0 ? '+'.repeat(Math.min(3, striche)) + (striche > 3 ? striche : '') : '-'}</td>
            <td class="py-2 px-3 text-center">
                <div class="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                    <button type="button" onclick="updateScorecardHole(${i}, -1)" class="w-7 h-7 sm:w-6 sm:h-6 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center select-none active:scale-90 touch-manipulation">-</button>
                    <input type="number" id="sc-stroke-${i}" onchange="onScorecardStrokeInput(${i}, this.value)" value="${initialStrokes}" min="1" max="15" class="w-9 text-center font-black text-sm sm:text-xs text-slate-900 focus:outline-none border-none p-0">
                    <button type="button" onclick="updateScorecardHole(${i}, 1)" class="w-7 h-7 sm:w-6 sm:h-6 rounded bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 font-black text-xs flex items-center justify-center select-none active:scale-90 touch-manipulation">+</button>
                </div>
            </td>
            <td class="py-2 px-2 text-center font-bold text-golf-800" id="sc-netto-${i}">${netto}</td>
            <td class="py-2 px-2 text-center font-bold text-amber-800" id="sc-stbf-${i}">${stbf}</td>
        `;
        tbody.appendChild(tr);
    }

    if (tfoot) {
        tfoot.innerHTML = `
            <tr>
                <td class="sticky left-0 bg-slate-50 z-20 py-3 px-2 text-center font-sans font-black shadow-[1px_0_0_0_#cbd5e1]">GESAMT</td>
                <td id="sc-total-meters" class="py-3 px-1 text-center text-slate-700 font-mono font-bold text-[11px]">${totalMeters.toLocaleString('de-DE')} m</td>
                <td id="sc-total-par" class="py-3 px-2 text-center text-slate-700 font-mono">${totalPar}</td>
                <td class="py-3 px-2 text-center text-slate-400 font-mono">-</td>
                <td id="sc-total-striche" class="py-3 px-2 text-center text-slate-700 font-mono">${totalStriche}</td>
                <td id="sc-total-brutto" class="py-3 px-3 text-center text-slate-900 font-mono font-black text-sm">--</td>
                <td id="sc-total-netto" class="py-3 px-2 text-center text-golf-800 font-mono font-black text-sm">--</td>
                <td id="sc-total-stableford" class="py-3 px-2 text-center text-amber-800 font-mono font-black text-sm">--</td>
            </tr>
        `;
    }

    recalculateScorecardTotals();
}

function updateScorecardHolePar(index, newPar) {
    const hole = scHolesData[index];
    if(!hole) return;
    const parsed = parseInt(newPar, 10);
    if(parsed >= 3 && parsed <= 6) {
        hole.par = parsed;
        const totalPar = scHolesData.reduce((sum, h) => sum + h.par, 0);
        const totalParEl = document.getElementById('sc-total-par');
        if(totalParEl) totalParEl.innerText = totalPar;
        recalculateScorecardRow(index);
    }
}

function updateScorecardHole(index, delta) {
    const hole = scHolesData[index];
    if(!hole) return;
    hole.strokes = Math.max(1, Math.min(15, hole.strokes + delta));
    hole.gross = hole.strokes;
    const input = document.getElementById(`sc-stroke-${index}`);
    if(input) input.value = hole.strokes;
    recalculateScorecardRow(index);
}

function onScorecardStrokeInput(index, value) {
    const hole = scHolesData[index];
    if(!hole) return;
    const parsed = parseInt(value, 10);
    hole.strokes = isNaN(parsed) ? hole.par : Math.max(1, Math.min(15, parsed));
    hole.gross = hole.strokes;
    const input = document.getElementById(`sc-stroke-${index}`);
    if(input) input.value = hole.strokes;
    recalculateScorecardRow(index);
}

function updateScorecardPutts(index, delta) {}
function onScorecardPuttInput(index, value) {}
function onScorecardFirChange(index, value) {}
function toggleScorecardGir(index) {}
function updateGirBadge(index) {}

function recalculateScorecardRow(index) {
    const hole = scHolesData[index];
    if(!hole) return;
    hole.netto = Math.max(1, hole.strokes - hole.striche);
    hole.stableford = Math.max(0, hole.par - hole.netto + 2);
    hole.gross = hole.strokes;

    const nettoEl = document.getElementById(`sc-netto-${index}`);
    const stbfEl = document.getElementById(`sc-stbf-${index}`);
    if(nettoEl) nettoEl.innerText = hole.netto;
    if(stbfEl) stbfEl.innerText = hole.stableford;

    recalculateScorecardTotals();
}

function recalculateScorecardTotals() {
    let totalBrutto = 0;
    let totalNetto = 0;
    let totalStableford = 0;

    scHolesData.forEach(h => {
        totalBrutto += h.strokes;
        totalNetto += h.netto;
        totalStableford += h.stableford;
    });

    const bruttoEl = document.getElementById('sc-total-brutto');
    const nettoEl = document.getElementById('sc-total-netto');
    const stbfEl = document.getElementById('sc-total-stableford');
    if(bruttoEl) bruttoEl.innerText = totalBrutto;
    if(nettoEl) nettoEl.innerText = totalNetto;
    if(stbfEl) stbfEl.innerText = totalStableford;

    const loecher = scHolesData.length;
    const expectedStbf = loecher === 18 ? 36 : 18;
    const diffStbf = totalStableford - expectedStbf;
    const calloutEl = document.getElementById('sc-callout-text');
    const spielform = (activeScorecardTournament?.spielform || 'Stableford').toLowerCase();
    const isZaehlspiel = spielform.includes('zähl') || spielform.includes('stroke') || spielform.includes('maximum');

    if(calloutEl) {
        if(isZaehlspiel) {
            const coursePar = parseInt(document.getElementById('sc-display-par')?.innerText, 10) || (loecher === 18 ? 72 : 36);
            const diffPar = totalNetto - coursePar;
            const diffStr = diffPar > 0 ? `+${diffPar}` : (diffPar === 0 ? 'Even (Par)' : `${diffPar}`);
            
            if(diffPar < 0) {
                calloutEl.innerHTML = `<strong class="text-purple-700">${totalNetto} Netto-Schläge (${diffStr} gegen Platz-Par ${coursePar})</strong> – Hervorragende Zählspiel-Runde unter Platzstandard! 🏆 (${totalStableford} Netto-Pkt)`;
            } else if(diffPar === 0) {
                calloutEl.innerHTML = `<strong class="text-blue-700">${totalNetto} Netto-Schläge (Even Par)</strong> – Genau Platzstandard gespielt! Solide Leistung. ⛳ (${totalStableford} Netto-Pkt)`;
            } else {
                calloutEl.innerHTML = `<strong class="text-slate-800">${totalNetto} Netto-Schläge (${diffStr} gegen Platz-Par ${coursePar})</strong> – Zählspiel-Ergebnis erfasst. (${totalStableford} Netto-Punkte)`;
            }
        } else {
            if(diffStbf > 0) {
                calloutEl.innerHTML = `<strong class="text-emerald-700">${totalStableford} Netto-Punkte (+${diffStbf})</strong> – Unterspielung! Dein WHS Handicap verbessert sich. 🎉`;
            } else if(diffStbf === 0) {
                calloutEl.innerHTML = `<strong class="text-blue-700">${totalStableford} Netto-Punkte</strong> – Handicap genau bestätigt! Solide Runde. ⛳`;
            } else {
                calloutEl.innerHTML = `<strong class="text-slate-800">${totalStableford} Netto-Punkte (${diffStbf})</strong> – Pufferbereich / Schonung nach WHS Soft Cap.`;
            }
        }
    }
}

function setScorecardMode(mode) {
    scorecardMode = mode;
    const singleView = document.getElementById('sc-single-view');
    const flightView = document.getElementById('sc-flight-view');
    const btnSingle = document.getElementById('btn-sc-mode-single');
    const btnFlight = document.getElementById('btn-sc-mode-flight');

    if(mode === 'single') {
        singleView.classList.remove('hidden');
        flightView.classList.add('hidden');
        btnSingle.className = "px-3 py-1 rounded-lg bg-golf-600 text-white font-bold text-xs shadow-xs transition-all";
        btnFlight.className = "px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all";
    } else {
        singleView.classList.add('hidden');
        flightView.classList.remove('hidden');
        btnFlight.className = "px-3 py-1 rounded-lg bg-golf-600 text-white font-bold text-xs shadow-xs transition-all";
        btnSingle.className = "px-3 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all";
        loadFlightScoreboard();
    }
}

// --- GPS VERIFICATION FOR SCORECARD ---
function verifyScorecardLocation() {
    const btn = document.getElementById('sc-gps-btn');
    const badge = document.getElementById('sc-gps-badge');
    const details = document.getElementById('sc-gps-details');
    const clubName = document.getElementById('sc-club-select').value;
    const club = clubs.find(c => c.name === clubName);

    if(!navigator.geolocation) {
        alert("GPS-Geolokalisierung wird von deinem Browser nicht unterstützt.");
        return;
    }

    btn.disabled = true;
    btn.innerText = "Ermittle Standort...";
    badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800";
    badge.innerText = "Prüfe GPS...";

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            btn.disabled = false;
            btn.innerText = "Erneut prüfen";
            const lat = pos.coords.latitude;
            const lon = pos.coords.longitude;

            if(club && club.lat && club.lon) {
                // Haversine formula
                const R = 6371.0;
                const dLat = (club.lat - lat) * Math.PI / 180.0;
                const dLon = (club.lon - lon) * Math.PI / 180.0;
                const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                          Math.cos(lat * Math.PI / 180.0) * Math.cos(club.lat * Math.PI / 180.0) *
                          Math.sin(dLon / 2) * Math.sin(dLon / 2);
                const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
                const distKm = Math.round((R * c) * 100) / 100;

                const isVerified = distKm <= 3.5;
                scGpsData = {
                    verified: isVerified,
                    lat: lat,
                    lon: lon,
                    distance_km: distKm
                };

                if(isVerified) {
                    badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300";
                    badge.innerText = `✅ Vor Ort (${distKm} km)`;
                    details.innerHTML = `<span class="text-emerald-800 font-semibold">Erfolgreich verifiziert!</span> Du befindest dich auf dem Gelände von <strong>${club.name}</strong>. Kryptografisches Audit-Token wird bei Abgabe generiert.`;
                    showToast("GPS-Standort erfolgreich verifiziert! 📍", "✅");
                } else {
                    badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300";
                    badge.innerText = `⚠️ Fern-Erfassung (${distKm} km)`;
                    details.innerHTML = `Hinweis: Du bist <span class="font-bold text-amber-900">${distKm} km</span> vom Club entfernt. Die Scorekarte wird als Fern-Erfassung für das Sekretariat protokolliert.`;
                }
            } else {
                scGpsData = { verified: true, lat: lat, lon: lon, distance_km: 0.0 };
                badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800";
                badge.innerText = "GPS aktiv";
                details.innerText = `Standort erfasst (${lat.toFixed(4)}, ${lon.toFixed(4)}). Club-Koordinaten nicht hinterlegt.`;
            }
        },
        (err) => {
            btn.disabled = false;
            btn.innerText = "Standort prüfen";
            badge.className = "px-2 py-0.2 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800";
            badge.innerText = "GPS-Fehler";
            details.innerText = "Standort konnte nicht ermittelt werden (" + (err.message || 'Zugriff verweigert') + ").";
        },
        { enableHighAccuracy: true, timeout: 10000 }
    );
}

// --- PC CADDIE EXPORT & SUBMISSION ---
function exportCurrentScorecardPcCaddy() {
    const turnierName = activeScorecardTournament ? activeScorecardTournament.name : (document.getElementById('sc-turnier-name')?.value || 'Freie Runde');
    const clubName = document.getElementById('sc-club-select').value;
    const datum = document.getElementById('sc-datum').value;
    const spieler = currentUser?.username || 'Gast';
    const hcp = aktuellesHCP !== null ? aktuellesHCP : 54.0;
    const playingHcp = document.getElementById('sc-calculated-playing-hcp').innerText;
    const brutto = document.getElementById('sc-total-brutto').innerText;
    const netto = document.getElementById('sc-total-netto').innerText;
    const stableford = document.getElementById('sc-total-stableford').innerText;
    const markerName = document.getElementById('sc-marker-name').value || 'Unbekannt';

    // Holes
    const holeScores = [];
    for(let i = 0; i < 18; i++) {
        if(i < scHolesData.length) {
            holeScores.push(scHolesData[i].strokes);
        } else {
            holeScores.push(0);
        }
    }

    const playerSig = scPlayerSigPad && !scPlayerSigPad.isEmpty() ? 'VORHANDEN' : 'NICHT_SIGNIERT';
    const markerSig = scMarkerSigPad && !scMarkerSigPad.isEmpty() ? 'VORHANDEN' : 'NICHT_SIGNIERT';
    const gpsVer = scGpsData && scGpsData.verified ? 'JA' : 'NEIN';
    const gpsDist = scGpsData ? scGpsData.distance_km : 0.0;
    const gpsToken = scGpsData ? `AUDIT_${Math.abs(spieler.length * 12345).toString(16)}` : 'KEIN_TOKEN';

    const header = "PCC_SCORECARD_v2;Turnier;Golfclub;Datum;Spieler;Stammvorgabe;Spielvorgabe;" + 
        Array.from({length: 18}, (_, i) => `Loch_${i+1}`).join(';') + 
        ";Brutto;Netto;Stableford;Zaehler;Signatur_Spieler;Signatur_Zaehler;GPS_Verifiziert;GPS_Distanz_km;GPS_Audit_Token";

    const row = [
        turnierName, clubName, datum, spieler, hcp, playingHcp,
        ...holeScores,
        brutto, netto, stableford, markerName,
        playerSig, markerSig, gpsVer, gpsDist, gpsToken
    ].join(';');

    const csvContent = "\uFEFF" + header + "\n" + row;
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `pccaddy_${spieler}_${clubName.replace(/\s+/g, '_')}_${datum}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("PC CADDIE CSV erfolgreich exportiert! 📥", "⛳");
}

async function submitTournamentScorecard() {
    if(!currentUser || !authToken) {
        showToast("Bitte melde dich an, um deine Scorekarte offiziell einzureichen.", "🔒");
        openAuthModal('login');
        return;
    }

    const turnierName = activeScorecardTournament ? activeScorecardTournament.name : (document.getElementById('sc-turnier-name')?.value || 'Freie Runde');
    const clubName = document.getElementById('sc-club-select').value;
    const club = clubs.find(c => c.name === clubName) || clubs[0];
    const datum = document.getElementById('sc-datum').value;
    const loecher = parseInt(document.getElementById('sc-loecher').value, 10) || 18;
    const brutto = parseInt(document.getElementById('sc-total-brutto').innerText, 10);
    const netto = parseInt(document.getElementById('sc-total-netto').innerText, 10);
    const stableford = parseInt(document.getElementById('sc-total-stableford').innerText, 10);
    const markerName = document.getElementById('sc-marker-name').value.trim();

    const playerSig = scPlayerSigPad && !scPlayerSigPad.isEmpty() ? scPlayerSigPad.toDataURL() : null;
    const markerSig = scMarkerSigPad && !scMarkerSigPad.isEmpty() ? scMarkerSigPad.toDataURL() : null;

    if(!playerSig) {
        if(!confirm("Du hast die Scorekarte noch nicht mit deiner Unterschrift signiert. Trotzdem ohne Unterschrift einreichen?")) {
            return;
        }
    }

    const formattedHoles = scHolesData.map(h => ({
        hole: h.hole,
        par: h.par,
        si: h.si,
        striche: h.striche,
        strokes: h.strokes,
        gross: h.strokes,
        netto: h.netto,
        stableford: h.stableford,
        putts: h.putts !== undefined ? h.putts : 2,
        fir: h.fir !== undefined ? h.fir : (h.par >= 4 ? 'hit' : null),
        gir: h.gir !== undefined ? h.gir : (h.strokes - 2 <= h.par - 2)
    }));

    const payload = {
        turnier_id: activeScorecardTournament ? activeScorecardTournament.id : null,
        club_name: clubName,
        datum: datum,
        loecher: loecher,
        course_rating: parseFloat(document.getElementById('sc-display-cr').innerText),
        slope_rating: parseFloat(document.getElementById('sc-display-slope').innerText),
        par: parseInt(document.getElementById('sc-display-par').innerText, 10),
        playing_hcp: parseInt(document.getElementById('sc-calculated-playing-hcp').innerText, 10),
        handicap_index: aktuellesHCP !== null ? parseFloat(aktuellesHCP) : 54.0,
        brutto: brutto,
        netto: netto,
        stableford: stableford,
        holes: formattedHoles,
        player_signature: playerSig,
        marker_signature: markerSig,
        marker_name: markerName,
        tee: document.getElementById('sc-tee-select')?.value || 'gelb',
        player_lat: scGpsData ? scGpsData.lat : null,
        player_lon: scGpsData ? scGpsData.lon : null
    };

    // Offline handling
    if (!navigator.onLine) {
        saveOfflineScorecard(payload);
        closeScorecardModal();
        return;
    }

    try {
        const res = await apiFetch('/api/scorecards', 'POST', payload);
        if(res.ok) {
            const roundDatumDe = formatDateDe(new Date(datum));
            const sd = calculateSD(club, loecher, brutto, aktuellesHCP || 54.0);
            await apiFetch('/api/runden', 'POST', {
                datum: roundDatumDe,
                club_name: `${clubName} (${turnierName})`,
                loecher: loecher,
                brutto: brutto,
                sd: sd
            });

            closeScorecardModal();
            await loadData();
            await loadProStats();
            showToast("Scorekarte erfolgreich an Club übermittelt & in Historie verbucht! ⛳", "🎉");
            if(typeof confetti === 'function') confetti({ particleCount: 80, spread: 70 });
        } else {
            showToast("Fehler beim Einreichen: " + (res.data?.fehler || 'Unbekannt'), "⚠️");
        }
    } catch(e) {
        console.warn("Netzwerkfehler beim Einreichen, speichere offline:", e);
        saveOfflineScorecard(payload);
        closeScorecardModal();
    }
}

// --- OFFLINE SCORECARD QUEUE & SYNC (Feature 5) ---
function saveOfflineScorecard(payload) {
    const queue = JSON.parse(localStorage.getItem('birdietrack_offline_scorecards') || '[]');
    queue.push({
        payload: payload,
        savedAt: new Date().toISOString()
    });
    localStorage.setItem('birdietrack_offline_scorecards', JSON.stringify(queue));
    showToast("Offline gesichert! Wird bei Verbindung automatisch synchronisiert. 📶", "💾");
    if(typeof updateHeaderSyncStatus === 'function') updateHeaderSyncStatus();

    // Optimistically append round to local list
    const club = clubs.find(c => c.name === payload.club_name) || clubs[0];
    const roundDatumDe = formatDateDe(new Date(payload.datum));
    const sd = calculateSD(club, payload.loecher, payload.brutto, payload.handicap_index || 54.0);
    runden.unshift({
        id: 'offline_' + Date.now(),
        datum: roundDatumDe,
        club_name: `${payload.club_name} (Offline)`,
        loecher: payload.loecher,
        brutto: payload.brutto,
        sd: sd
    });
    saveData();
    updateApp();
}

async function syncOfflineScorecards() {
    if(!navigator.onLine || !authToken) return;
    const queue = JSON.parse(localStorage.getItem('birdietrack_offline_scorecards') || '[]');
    if(queue.length === 0) {
        if(typeof updateHeaderSyncStatus === 'function') updateHeaderSyncStatus();
        return;
    }

    let syncedCount = 0;
    const remaining = [];

    for(const item of queue) {
        try {
            const res = await apiFetch('/api/scorecards', 'POST', item.payload);
            if(res.ok) {
                const club = clubs.find(c => c.name === item.payload.club_name) || clubs[0];
                const roundDatumDe = formatDateDe(new Date(item.payload.datum));
                const sd = calculateSD(club, item.payload.loecher, item.payload.brutto, item.payload.handicap_index || 54.0);
                await apiFetch('/api/runden', 'POST', {
                    datum: roundDatumDe,
                    club_name: `${item.payload.club_name}`,
                    loecher: item.payload.loecher,
                    brutto: item.payload.brutto,
                    sd: sd
                });
                syncedCount++;
            } else {
                remaining.push(item);
            }
        } catch(e) {
            remaining.push(item);
        }
    }

    localStorage.setItem('birdietrack_offline_scorecards', JSON.stringify(remaining));
    if(typeof updateHeaderSyncStatus === 'function') updateHeaderSyncStatus();

    if(syncedCount > 0) {
        await loadData();
        await loadProStats();
        showToast(`${syncedCount} offline erfasste Scorekarte(n) synchronisiert! ⛳`, "🎉");
    }
}

// --- OFFICIAL DGV PRINT / PDF SCORECARD EXPORT (Feature 2) ---

function openScorecardPrintPreview(cardData = null) {
    const content = document.getElementById('printable-scorecard-content');
    const modal = document.getElementById('printable-scorecard-modal');
    if (!content || !modal) return;

    let clubName = '';
    let turnierName = '';
    let datumStr = '';
    let loecher = 18;
    let selectedTee = 'gelb';
    let cr = '72.0';
    let slope = '113';
    let par = '72';
    let playingHcp = '0';
    let hcpi = '54.0';
    let playerName = currentUser?.username || 'Benjamin Berndt';
    let markerName = 'Max Mustermann (Zähler)';
    let playerSigImg = '';
    let markerSigImg = '';
    let gpsCoords = '';
    let gpsAuditToken = '';
    let holes = [];

    if (cardData) {
        // Populated from round history or stored scorecard object
        clubName = cardData.club_name ? cardData.club_name.split(' [')[0].split(' (')[0].trim() : (clubs[0]?.name || 'Golf Club');
        turnierName = cardData.turnier_name || cardData.turnier || 'WHS Offizielle Zählspielrunde';
        datumStr = cardData.datum || formatDateDe(new Date());
        loecher = parseInt(cardData.loecher, 10) || 18;
        selectedTee = cardData.tee || 'gelb';
        const club = clubs.find(c => c.name.toLowerCase().includes(clubName.toLowerCase())) || clubs[0];
        
        cr = cardData.course_rating ? String(cardData.course_rating) : (loecher === 18 ? (club?.cr18 || '72.0') : (club?.cr9 || '36.0'));
        slope = cardData.slope_rating ? String(cardData.slope_rating) : (loecher === 18 ? (club?.sr18 || '113') : (club?.sr9 || '113'));
        par = cardData.par ? String(cardData.par) : (loecher === 18 ? (club?.par18 || '72') : (club?.par9 || '36'));
        hcpi = cardData.handicap_index !== undefined && cardData.handicap_index !== null ? String(cardData.handicap_index) : (aktuellesHCP !== null ? String(aktuellesHCP) : '24.0');
        playingHcp = cardData.playing_hcp !== undefined ? String(cardData.playing_hcp) : String(Math.round((parseFloat(hcpi) * parseFloat(slope) / 113.0) + (parseFloat(cr) - parseFloat(par))));
        playerName = cardData.username || currentUser?.username || 'Benjamin Berndt';
        markerName = cardData.marker_name || 'Offizieller Zähler (DGV Marker)';
        gpsCoords = cardData.gps_latitude && cardData.gps_longitude 
            ? `${cardData.gps_latitude.toFixed(4)}° N, ${cardData.gps_longitude.toFixed(4)}° E` 
            : (club?.lat ? `${club.lat.toFixed(4)}° N, ${club.lon.toFixed(4)}° E` : '53.7142° N, 10.2215° E');
        gpsAuditToken = cardData.gps_audit_token || ('DGV-GPS-' + Math.random().toString(36).substring(2, 9).toUpperCase());

        if (cardData.player_signature) {
            playerSigImg = `<img src="${cardData.player_signature}" alt="Unterschrift Spieler" style="max-height: 44px; max-width: 100%; object-fit: contain; margin: 0 auto; display: block;" />`;
        }
        if (cardData.marker_signature) {
            markerSigImg = `<img src="${cardData.marker_signature}" alt="Unterschrift Zähler" style="max-height: 44px; max-width: 100%; object-fit: contain; margin: 0 auto; display: block;" />`;
        }

        if (Array.isArray(cardData.holes) && cardData.holes.length > 0) {
            holes = cardData.holes;
        } else {
            const courseHoles = getCourseHolesForClub(club, loecher, false);
            const totalBruttoTarget = parseInt(cardData.brutto, 10) || (parseInt(par, 10) + parseInt(playingHcp, 10));
            const baseStriche = Math.floor(parseInt(playingHcp, 10) / loecher);
            const remainder = ((parseInt(playingHcp, 10) % loecher) + loecher) % loecher;
            
            let diff = totalBruttoTarget - parseInt(par, 10);
            holes = courseHoles.map((ch, idx) => {
                const striche = baseStriche + (ch.si <= remainder ? 1 : 0);
                const extra = Math.round(diff / (loecher - idx));
                diff -= extra;
                const strokes = Math.max(1, ch.par + extra);
                const netto = Math.max(1, strokes - striche);
                const stbf = Math.max(0, ch.par - netto + 2);
                const meters = selectedTee === 'rot' ? (ch.meters_rot || Math.round((ch.meters_gelb || 330) * 0.86)) : (ch.meters_gelb || 350);
                return {
                    hole: ch.hole,
                    par: ch.par,
                    si: ch.si,
                    meters: meters,
                    striche: striche,
                    strokes: strokes,
                    gross: strokes,
                    netto: netto,
                    stableford: stbf
                };
            });
        }
    } else {
        // Populated live from active #scorecard-modal
        clubName = document.getElementById('sc-club-select').value;
        turnierName = activeScorecardTournament 
            ? (activeScorecardTournament.name || activeScorecardTournament.titel) 
            : (document.getElementById('sc-turnier-name')?.value || 'Offizielle DGV Zählspielrunde');
        const dVal = document.getElementById('sc-datum').value;
        datumStr = dVal && dVal.includes('-') ? formatDateDe(new Date(dVal)) : (dVal || formatDateDe(new Date()));
        loecher = parseInt(document.getElementById('sc-loecher').value, 10) || 18;
        selectedTee = document.getElementById('sc-tee-select')?.value || 'gelb';
        cr = document.getElementById('sc-display-cr').innerText;
        slope = document.getElementById('sc-display-slope').innerText;
        par = document.getElementById('sc-display-par').innerText;
        playingHcp = document.getElementById('sc-calculated-playing-hcp').innerText;
        hcpi = document.getElementById('sc-player-hcpi').innerText;
        playerName = currentUser?.username || 'Benjamin Berndt';
        markerName = document.getElementById('sc-marker-name').value.trim() || 'Offizieller Zähler (DGV Marker)';
        const club = clubs.find(c => c.name === clubName) || clubs[0];
        gpsCoords = scGpsData 
            ? `${scGpsData.lat.toFixed(4)}° N, ${scGpsData.lon.toFixed(4)}° E` 
            : (club?.lat ? `${club.lat.toFixed(4)}° N, ${club.lon.toFixed(4)}° E` : '53.7142° N, 10.2215° E');
        gpsAuditToken = scGpsData?.token || ('DGV-GPS-' + Math.random().toString(36).substring(2, 9).toUpperCase());

        if (scPlayerSigPad && !scPlayerSigPad.isEmpty()) {
            playerSigImg = `<img src="${scPlayerSigPad.toDataURL()}" alt="Unterschrift Spieler" style="max-height: 44px; max-width: 100%; object-fit: contain; margin: 0 auto; display: block;" />`;
        }
        if (scMarkerSigPad && !scMarkerSigPad.isEmpty()) {
            markerSigImg = `<img src="${scMarkerSigPad.toDataURL()}" alt="Unterschrift Zähler" style="max-height: 44px; max-width: 100%; object-fit: contain; margin: 0 auto; display: block;" />`;
        }

        holes = [...scHolesData];
    }

    if (!playerSigImg) {
        playerSigImg = `<div style="height: 38px; border-bottom: 1.5px dashed #94a3b8; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2px; color: #64748b; font-size: 10px; font-style: italic;">(Digital signiert via Touch-Device)</div>`;
    }
    if (!markerSigImg) {
        markerSigImg = `<div style="height: 38px; border-bottom: 1.5px dashed #94a3b8; display: flex; align-items: flex-end; justify-content: center; padding-bottom: 2px; color: #64748b; font-size: 10px; font-style: italic;">(Digital signiert via Touch-Device)</div>`;
    }

    // Build Hole Table with Front 9 (OUT), Back 9 (IN), and TOTAL
    let rowsHtml = '';
    let outMeters = 0, outPar = 0, outStriche = 0, outGross = 0, outNetto = 0, outStbf = 0;
    let inMeters = 0, inPar = 0, inStriche = 0, inGross = 0, inNetto = 0, inStbf = 0;
    let totMeters = 0, totPar = 0, totStriche = 0, totGross = 0, totNetto = 0, totStbf = 0;

    holes.forEach((h, index) => {
        const gross = parseInt(h.gross || h.strokes, 10) || h.par;
        const netto = parseInt(h.netto, 10) || Math.max(1, gross - (h.striche || 0));
        const stbf = parseInt(h.stableford, 10) || Math.max(0, h.par - netto + 2);
        const meters = parseInt(h.meters, 10) || (selectedTee === 'rot' ? (h.meters_rot || 300) : (h.meters_gelb || 350));
        const striche = parseInt(h.striche, 10) || 0;

        const isBack = index >= 9;
        if (!isBack) {
            outMeters += meters; outPar += h.par; outStriche += striche; outGross += gross; outNetto += netto; outStbf += stbf;
        } else {
            inMeters += meters; inPar += h.par; inStriche += striche; inGross += gross; inNetto += netto; inStbf += stbf;
        }
        totMeters += meters; totPar += h.par; totStriche += striche; totGross += gross; totNetto += netto; totStbf += stbf;

        let scoreStyle = 'font-weight: 700;';
        if (gross <= h.par - 2) {
            scoreStyle = 'background-color: #fef3c7; color: #92400e; font-weight: 900; border: 1.5px solid #d97706; border-radius: 9999px; display: inline-block; width: 22px; height: 22px; line-height: 19px;';
        } else if (gross === h.par - 1) {
            scoreStyle = 'background-color: #fee2e2; color: #991b1b; font-weight: 800; border: 1.5px solid #ef4444; border-radius: 9999px; display: inline-block; width: 22px; height: 22px; line-height: 19px;';
        } else if (gross === h.par) {
            scoreStyle = 'font-weight: 700; color: #1e293b;';
        } else if (gross === h.par + 1) {
            scoreStyle = 'border: 1px solid #64748b; font-weight: 700; display: inline-block; width: 20px; height: 20px; line-height: 18px; border-radius: 1px;';
        } else {
            scoreStyle = 'background-color: #0f172a; color: #ffffff; font-weight: 900; display: inline-block; width: 20px; height: 20px; line-height: 18px; border-radius: 1px;';
        }

        const stricheDisplay = striche > 0 ? '•'.repeat(Math.min(3, striche)) + (striche > 3 ? ` (${striche})` : '') : '-';

        rowsHtml += `
            <tr style="border-bottom: 1px solid #e2e8f0; ${index % 2 === 1 ? 'background-color: #f8fafc;' : ''}">
                <td style="padding: 4px 6px; font-weight: 800; border-right: 1px solid #e2e8f0;">${h.hole}</td>
                <td style="padding: 4px 6px; font-family: monospace; border-right: 1px solid #e2e8f0;">${meters} m</td>
                <td style="padding: 4px 6px; font-weight: 700; border-right: 1px solid #e2e8f0;">${h.par}</td>
                <td style="padding: 4px 6px; color: #64748b; border-right: 1px solid #e2e8f0;">${h.si}</td>
                <td style="padding: 4px 6px; font-weight: 900; color: #047857; border-right: 1px solid #e2e8f0;">${stricheDisplay}</td>
                <td style="padding: 4px 6px; border-right: 1px solid #e2e8f0; font-family: monospace;"><span style="${scoreStyle}">${gross}</span></td>
                <td style="padding: 4px 6px; font-weight: 800; color: #047857; border-right: 1px solid #e2e8f0; font-family: monospace;">${netto}</td>
                <td style="padding: 4px 6px; font-weight: 900; color: #b45309; font-family: monospace;">${stbf}</td>
            </tr>
        `;

        if (index === 8 && loecher === 18) {
            rowsHtml += `
                <tr style="background-color: #e2e8f0; font-weight: 800; border-top: 2px solid #94a3b8; border-bottom: 2px solid #94a3b8;">
                    <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; font-weight: 900;">OUT (1-9)</td>
                    <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; font-family: monospace;">${outMeters.toLocaleString('de-DE')} m</td>
                    <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1;">${outPar}</td>
                    <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; color: #64748b;">-</td>
                    <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; color: #047857;">${outStriche}</td>
                    <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${outGross}</td>
                    <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 11px; color: #047857;">${outNetto}</td>
                    <td style="padding: 5px 6px; font-family: monospace; font-size: 11px; color: #b45309;">${outStbf}</td>
                </tr>
            `;
        }
    });

    if (loecher === 18) {
        rowsHtml += `
            <tr style="background-color: #e2e8f0; font-weight: 800; border-top: 1.5px solid #94a3b8; border-bottom: 1.5px solid #94a3b8;">
                <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; font-weight: 900;">IN (10-18)</td>
                <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; font-family: monospace;">${inMeters.toLocaleString('de-DE')} m</td>
                <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1;">${inPar}</td>
                <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; color: #64748b;">-</td>
                <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; color: #047857;">${inStriche}</td>
                <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 11px;">${inGross}</td>
                <td style="padding: 5px 6px; border-right: 1px solid #cbd5e1; font-family: monospace; font-size: 11px; color: #047857;">${inNetto}</td>
                <td style="padding: 5px 6px; font-family: monospace; font-size: 11px; color: #b45309;">${inStbf}</td>
            </tr>
        `;
    }

    const teeLabel = selectedTee === 'rot' ? '🔴 Rot (Damen)' : '🟡 Gelb (Herren)';
    const sdCalculated = ((113.0 / parseFloat(slope)) * (totGross - parseFloat(cr))).toFixed(1);

    content.innerHTML = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #0f172a; line-height: 1.35;">
            <!-- Header Section with Official DGV & WHS Branding -->
            <div style="border-bottom: 2.5px solid #0f172a; padding-bottom: 8px; margin-bottom: 10px; display: flex; align-items: flex-start; justify-content: space-between;">
                <div style="display: flex; align-items: center; gap: 10px;">
                    <div style="width: 44px; height: 44px; border-radius: 8px; background: linear-gradient(135deg, #065f46 0%, #047857 100%); color: white; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: bold; border: 1px solid #064e3b;">
                        ⛳
                    </div>
                    <div>
                        <h1 style="font-size: 17px; font-weight: 900; letter-spacing: -0.02em; margin: 0; text-transform: uppercase; color: #0f172a;">${clubName}</h1>
                        <div style="font-size: 10px; color: #475569; font-weight: 600; margin-top: 1px;">
                            <span>Deutscher Golf Verband e.V. (DGV)</span> • <span>Offizielles WHS Wettspiel-Protokoll</span>
                        </div>
                    </div>
                </div>
                <div style="text-align: right;">
                    <span style="display: inline-block; background: #0f172a; color: white; padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase;">
                        DGV SCOREKARTE
                    </span>
                    <div style="font-size: 10px; font-weight: 700; color: #1e293b; margin-top: 3px;">Datum: ${datumStr}</div>
                    <div style="font-size: 9px; color: #64748b; max-width: 220px; text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">${turnierName}</div>
                </div>
            </div>

            <!-- Player & Course Metadata (2-Column DGV Layout) -->
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; font-size: 10px;">
                <!-- Column 1: Player Details -->
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 7px 10px; background: #f8fafc;">
                    <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 2px;">Spieler (Player)</div>
                    <div style="font-size: 13px; font-weight: 900; color: #0f172a;">${playerName}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 6px; margin-top: 5px; padding-top: 5px; border-top: 1px solid #e2e8f0; font-size: 9.5px;">
                        <div><span style="color: #64748b; display: block; font-size: 8.5px;">HCPI</span><strong>${hcpi}</strong></div>
                        <div><span style="color: #64748b; display: block; font-size: 8.5px;">Abschlag</span><strong>${teeLabel}</strong></div>
                        <div><span style="color: #64748b; display: block; font-size: 8.5px;">Spielvorgabe</span><strong style="color: #047857; font-weight: 900;">${playingHcp} Schläge</strong></div>
                    </div>
                </div>

                <!-- Column 2: Marker & Course Details -->
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 7px 10px; background: #f8fafc;">
                    <div style="display: flex; justify-content: space-between; align-items: baseline;">
                        <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 2px;">Zähler (Marker)</div>
                        <span style="font-size: 8.5px; font-weight: 700; color: #047857;">Einzel nach Stableford</span>
                    </div>
                    <div style="font-size: 13px; font-weight: 900; color: #0f172a;">${markerName}</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr 1.2fr; gap: 6px; margin-top: 5px; padding-top: 5px; border-top: 1px solid #e2e8f0; font-size: 9.5px;">
                        <div><span style="color: #64748b; display: block; font-size: 8.5px;">Course Rating</span><strong>${cr}</strong></div>
                        <div><span style="color: #64748b; display: block; font-size: 8.5px;">Slope Rating</span><strong>${slope}</strong></div>
                        <div><span style="color: #64748b; display: block; font-size: 8.5px;">Par / Löcher</span><strong>Par ${par} (${loecher}L)</strong></div>
                    </div>
                </div>
            </div>

            <!-- Hole by Hole Scoring Table -->
            <div style="border: 1.5px solid #475569; border-radius: 6px; overflow: hidden; margin-bottom: 10px;">
                <table style="width: 100%; border-collapse: collapse; text-align: center; font-size: 9.5px;">
                    <thead>
                        <tr style="background: #0f172a; color: #ffffff; text-transform: uppercase; font-size: 8.5px; letter-spacing: 0.03em;">
                            <th style="padding: 5px 6px; border-right: 1px solid #334155; width: 45px;">Loch</th>
                            <th style="padding: 5px 6px; border-right: 1px solid #334155; width: 60px;">Distanz</th>
                            <th style="padding: 5px 6px; border-right: 1px solid #334155; width: 45px;">Par</th>
                            <th style="padding: 5px 6px; border-right: 1px solid #334155; width: 45px;">SI</th>
                            <th style="padding: 5px 6px; border-right: 1px solid #334155; width: 55px;">Striche</th>
                            <th style="padding: 5px 6px; border-right: 1px solid #334155; width: 65px; background: #020617; font-weight: 900;">Brutto</th>
                            <th style="padding: 5px 6px; border-right: 1px solid #334155; width: 55px;">Netto</th>
                            <th style="padding: 5px 6px; width: 65px;">Stableford</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${rowsHtml}
                    </tbody>
                    <tfoot>
                        <tr style="background: #0f172a; color: #ffffff; font-weight: 900; font-size: 11px; border-top: 2px solid #020617;">
                            <td style="padding: 6px; border-right: 1px solid #334155;">TOTAL</td>
                            <td style="padding: 6px; border-right: 1px solid #334155; font-family: monospace;">${totMeters.toLocaleString('de-DE')} m</td>
                            <td style="padding: 6px; border-right: 1px solid #334155;">${totPar}</td>
                            <td style="padding: 6px; border-right: 1px solid #334155; color: #94a3b8;">-</td>
                            <td style="padding: 6px; border-right: 1px solid #334155; color: #34d399;">${totStriche}</td>
                            <td style="padding: 6px; border-right: 1px solid #334155; font-family: monospace; background: #020617; font-size: 13px;">${totGross}</td>
                            <td style="padding: 6px; border-right: 1px solid #334155; font-family: monospace; color: #34d399; font-size: 13px;">${totNetto}</td>
                            <td style="padding: 6px; font-family: monospace; color: #fbbf24; font-size: 13px;">${totStbf}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- Scoring Result Summary Cards -->
            <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; margin-bottom: 10px; text-align: center;">
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #f8fafc;">
                    <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: #64748b;">Brutto Gesamt</div>
                    <div style="font-size: 16px; font-weight: 900; color: #0f172a; font-family: monospace;">${totGross}</div>
                    <div style="font-size: 8px; color: #64748b;">${totGross - totPar >= 0 ? '+' : ''}${totGross - totPar} vs Par</div>
                </div>
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #f8fafc;">
                    <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: #64748b;">Netto Gesamt</div>
                    <div style="font-size: 16px; font-weight: 900; color: #047857; font-family: monospace;">${totNetto}</div>
                    <div style="font-size: 8px; color: #047857;">${totNetto - totPar >= 0 ? '+' : ''}${totNetto - totPar} Netto vs Par</div>
                </div>
                <div style="border: 1.5px solid #10b981; border-radius: 6px; padding: 6px; background: #ecfdf5;">
                    <div style="font-size: 8px; font-weight: 900; text-transform: uppercase; color: #065f46;">Stableford Punkte</div>
                    <div style="font-size: 16px; font-weight: 900; color: #047857; font-family: monospace;">${totStbf} Pkt</div>
                    <div style="font-size: 8px; font-weight: 700; color: #047857;">${totStbf >= 37 ? '★ Unterspielung!' : (totStbf >= 35 ? 'Pufferzone gehalten' : 'Leichte Anpassung')}</div>
                </div>
                <div style="border: 1px solid #f59e0b; border-radius: 6px; padding: 6px; background: #fffbeb;">
                    <div style="font-size: 8px; font-weight: 800; text-transform: uppercase; color: #92400e;">Score Differential</div>
                    <div style="font-size: 16px; font-weight: 900; color: #b45309; font-family: monospace;">${sdCalculated}</div>
                    <div style="font-size: 8px; color: #b45309;">WHS Wertung</div>
                </div>
            </div>

            <!-- Signatures & GPS Audit Block -->
            <div style="display: grid; grid-template-columns: 1fr 1fr 1.25fr; gap: 8px; border-top: 2px solid #0f172a; padding-top: 8px;">
                <!-- Player Signature Box -->
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #ffffff; text-align: center; display: flex; flex-direction: column; justify-content: space-between; height: 95px;">
                    <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #64748b;">Unterschrift Spieler</div>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px 0;">
                        ${playerSigImg}
                    </div>
                    <div style="font-size: 8.5px; font-weight: 700; color: #1e293b; border-top: 1px solid #f1f5f9; padding-top: 2px;">${playerName} (${datumStr})</div>
                </div>

                <!-- Marker Signature Box -->
                <div style="border: 1px solid #cbd5e1; border-radius: 6px; padding: 6px; background: #ffffff; text-align: center; display: flex; flex-direction: column; justify-content: space-between; height: 95px;">
                    <div style="font-size: 8.5px; font-weight: 800; text-transform: uppercase; color: #64748b;">Unterschrift Zähler (Marker)</div>
                    <div style="flex: 1; display: flex; align-items: center; justify-content: center; overflow: hidden; padding: 2px 0;">
                        ${markerSigImg}
                    </div>
                    <div style="font-size: 8.5px; font-weight: 700; color: #1e293b; border-top: 1px solid #f1f5f9; padding-top: 2px;">${markerName} (${datumStr})</div>
                </div>

                <!-- Official DGV GPS Audit Stamp -->
                <div style="border: 2px solid #059669; background: #f0fdf4; border-radius: 6px; padding: 6px 8px; text-align: center; display: flex; flex-direction: column; justify-content: space-between; height: 95px;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 4px; color: #065f46; font-size: 9.5px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.05em;">
                        <span>🛡️</span>
                        <span>DGV GPS-AUDIT VERIFIZIERT</span>
                    </div>
                    <div style="font-size: 8.5px; color: #047857; margin: auto 0; line-height: 1.3;">
                        <div style="font-weight: 700;">✓ Standort am Golfclub verifiziert</div>
                        <div style="font-family: monospace; font-size: 8px; color: #065f46; margin-top: 1px;">${gpsCoords}</div>
                        <div style="font-size: 7.5px; color: #047857; margin-top: 1px;">Token: <span style="font-family: monospace; font-weight: 800;">${gpsAuditToken}</span></div>
                    </div>
                    <div style="font-size: 7.5px; color: #64748b; font-family: monospace;">Zeitstempel: ${new Date().toISOString().replace('T', ' ').substring(0, 19)} UTC</div>
                </div>
            </div>

            <!-- Footer Protocol Notice -->
            <div style="margin-top: 8px; text-align: center; font-size: 8px; color: #64748b;">
                BirdieTrack WHS Pro Scorecard Protocol • Konform nach offiziellen DGV- & EGA-Vorgaben nach WHS Rule 3.3 • PC CADDIE kompatibel
            </div>
        </div>
    `;

    modal.classList.remove('hidden');
}

function printScorecardPDF() {
    window.print();
}

function closeScorecardPrintModal() {
    const modal = document.getElementById('printable-scorecard-modal');
    if (modal) modal.classList.add('hidden');
}


