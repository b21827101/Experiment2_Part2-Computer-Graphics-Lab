"use strict";

/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

var gl;
var type;
var normalize;
var stride;
var offset;
var program;

let rotation = [0, 1];
let currentScale = [1.0, 1.0];

let scale;
let colorF;
let rotationV;
let angle;

// Animation timing
let previousTime = 0.0;
let degreesPerSecond = 25.0; //the number of degrees per second the emoji

var pressed = { //for the keyboard keys
    press2: false,
    press1: false,
    press3: false,
    pressDefault: false
};
var round = {
    lRound1: true,
    lRound2: false, //for the spin movement
    rRound1: false,
    rRound2: false
};

main();

function main() {
    const canvas = document.querySelector("#glcanvas"); //canvas element
    gl = canvas.getContext("webgl2");

    if(!gl) {
        alert("WebGL 2.0 is not available."); //if it fail,alert it
        return;
    }

    program = initShaderProgram(gl, vsSource, fsSource);
    gl.useProgram(program);//tell webgl use program when drawing it

    const posOfLeftEye = [];
    const posOfRightEye = [];
    const posOfYellowCircle = [];

    const eyeColor =[]; //color of eyes
    const skinColor =[]; //yellow

    const eyeRadius = 0.04; //for small circle
    const faceRadius =0.26;  //for big circle

    const maskColor =[]; //color of mask

    const upperBezier=[-0.17, -0.03, 0.0, 0.10, 0.17, -0.03]; //upper curve of mask
    const bottomBezier =[-0.17, -0.16, 0.0, -0.29, 0.17,-0.16];//lower curve of mask


    const posOfUpperCurve = [];
    const posOfBottomCurve = [];

    const curveForfirstHandle = [];
    const curveForsecondHandle = [];
    const curveForthirdHandle= []; //handles of mask
    const curveForfourthHandle = [];

    //Position of white mask
    /*0. index : maskenin pozisyonları
     * 1. index: sol üst maske
     * 2.index : sağ üst maske
     * 3.index: sol alt maske
     * 4. index: sağ alt maske
     */

    const posOfMask = [[upperBezier[0], upperBezier[1],upperBezier[4], upperBezier[5],bottomBezier[4], bottomBezier[5],bottomBezier[0], bottomBezier[1]],
        [upperBezier[0]-0.090, upperBezier[1]+0.04, upperBezier[0], upperBezier[1],  upperBezier[0], upperBezier[1]-0.03,upperBezier[0]-0.089, upperBezier[1]+0.01],
        [upperBezier[4], upperBezier[5],upperBezier[4]+0.090, upperBezier[1]+0.04, upperBezier[4]+0.089, upperBezier[1]+0.01,upperBezier[4], upperBezier[1]-0.03],
        [upperBezier[0]-0.042, -0.15, bottomBezier[0],  bottomBezier[1]+0.03,bottomBezier[0], bottomBezier[1], bottomBezier[0]-0.026, bottomBezier[1]-0.01],
        [bottomBezier[4], bottomBezier[5]+0.03,bottomBezier[4]+0.042, -0.15, bottomBezier[4]+0.026, bottomBezier[5]-0.01, bottomBezier[4], bottomBezier[5]]
    ];

    //for curve handles of mask
    const curveOfHandleMask =[[posOfMask[1][0],posOfMask[1][1],-0.263,-0.01 ,posOfMask[1][6],posOfMask[1][7]],
        [posOfMask[2][2],posOfMask[2][3], 0.263,-0.01, posOfMask[2][4],posOfMask[2][5]],
        [posOfMask[3][0],posOfMask[3][1],-0.21,-0.16, posOfMask[3][6],posOfMask[3][7]],
        [posOfMask[4][2],posOfMask[4][3], 0.21, -0.16, posOfMask[4][4],posOfMask[4][5]]];


    type = gl.FLOAT;
    normalize = false;
    stride = 0;
    offset = 0;


    gl.viewport(0,0,canvas.width,canvas.height);

    gl.clearColor(1,1,1,1.0); //color the background white
    gl.clearDepth(1.0);                 // Clear everything
    gl.enable(gl.DEPTH_TEST);           // Enable depth testing
    gl.depthFunc(gl.LEQUAL);            // Near things obscure far things
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);// Clear the canvas before we start drawing on it.

    let aspectRatio = canvas.width/canvas.height;
    rotation = [0, 1];
    currentScale = [1.0, aspectRatio];


    angle = 0.0;

    //to draw circles
    var bufferCircle = toCircle(gl, posOfYellowCircle, skinColor, 0, 0, faceRadius);

    //console.log( bufferCircle.color[0]+" "+ bufferCircle.color[1]+" "+ bufferCircle.color[2]);

    drawScene(bufferCircle,0,101,true);
    drawScene(toCircle(gl,posOfLeftEye,eyeColor,-0.1,0.1,eyeRadius),0,101,false);
    drawScene(toCircle(gl,posOfRightEye,eyeColor,0.1,0.1,eyeRadius),0,101,false);

    drawScene(toBezier(gl,posOfBottomCurve, bottomBezier, maskColor),0, posOfBottomCurve.length / 2,false);
    drawScene(toBezier(gl,posOfUpperCurve, upperBezier, maskColor),0, posOfUpperCurve.length / 2,false);

    drawScene(toSquare(gl, posOfMask[0],maskColor),0, 4); //middle of the mask

    //draw handles of the mask
    drawScene(toSquare(gl, posOfMask[1],maskColor),0, 4);//each of them is handle of mask
    drawScene(toBezier(gl,curveForfirstHandle,curveOfHandleMask[0],maskColor),0, curveForfirstHandle.length / 2,false);

    drawScene(toSquare(gl, posOfMask[2],maskColor),0, 4);
    drawScene(toBezier(gl,curveForsecondHandle,curveOfHandleMask[1],maskColor),0, curveForsecondHandle.length / 2,false);

    drawScene(toSquare(gl, posOfMask[3],maskColor),0, 4);
    drawScene(toBezier(gl,curveForthirdHandle,curveOfHandleMask[2],maskColor),0, curveForthirdHandle.length / 2,false);

    drawScene(toSquare(gl, posOfMask[4],maskColor),0, 4);
    drawScene(toBezier(gl,curveForfourthHandle,curveOfHandleMask[3],maskColor),0, curveForfourthHandle.length / 2,false);

}


document.onkeydown = function (e) {

    switch (e.key) {
        case "2": //Use ‘2’ key
            pressed.press2 = true;
            pressed.pressDefault = true;
            pressed.press1= false;
            pressed.press3 = false;
            round.lRound1= true;
            round.lRound2= false; //each press 2,start to spin again in the correct order
            round.rRound1 = false;
            round.rRound2 = false
            main();
            break;
        case "1":  //Use ‘1’ key
            pressed.press2 = false;
            pressed.press3 = false;
            pressed.press1= true;
            main();
            break;
        case "3":  //Use ‘3’ key
            if(!pressed.press1 && !pressed.press2 || (pressed.press1)){
                pressed.press3= true;  //set up true for determine color changing situations
                pressed.pressDefault = true;
                pressed.press1= false;
                pressed.press2= true;
                main();
                break;
            }
            pressed.press2= true;
            pressed.press3= true;
            pressed.pressDefault = true;
            pressed.press1= false;
            break;
        default:
            break;
    }
}

function drawScene(buffer,offset, NumVertices,boolChangeColor) {

        let radians;
        //steps of swing animation

        //according to emoji's movement,i have to change value of radians and angle
        if(angle>=45){
            if(round.lRound2){//left side [-45,0]
                radians = ((angle * Math.PI / 180.0)+ (-Math.PI/2));
                round.lRound1 = false;
                round.rRound1 = true;
            }
            else if(round.rRound2){//left side [45,0]
                radians = (- angle * Math.PI / 180.0)+(Math.PI/2);
                round.lRound1 = true;
                round.rRound1 = false;
            }
        }
        else if(angle>=0 && angle<45) {
            if(round.lRound1){//left side [0,-45]
                radians = -(angle * Math.PI / 180.0);
                round.lRound2 = true;
                round.rRound2 = false;
            }
            else if(round.rRound1){//left side [0,45]
                radians = (angle * Math.PI / 180.0);
                round.lRound2 = false;
                round.rRound2 = true;
            }
        }
        //rotation is the location of the point on the unit circle located at the angle.
        rotation[0] = Math.sin(radians);
        rotation[1] = Math.cos(radians);

        scale =
            gl.getUniformLocation(program, "uScalingFactor");//current scale
        colorF =
            gl.getUniformLocation(program, "fColor");
        rotationV =
            gl.getUniformLocation(program, "uRotationVector"); //current rotation vector

        gl.uniform2fv(scale, currentScale);
        gl.uniform2fv(rotationV, rotation);

        if(boolChangeColor && pressed.press3) { //if i press "3" key ,change only color of skin

            //console.log("angle "+angle+" "+ buffer.color[0]+" "+ buffer.color[1]+" "+ buffer.color[2]);
            // update the color
            if(angle<45) { //for first and third movement
                buffer.color[0] = 0.929 - (0.016 * angle / 45);
                buffer.color[1] = 0.843 - (0.185 * angle / 45);
                buffer.color[2] = 0.239 - (0.039 * angle / 45);
            }
            else if(angle>=45){ //for second and fourth movement
                buffer.color[0] = 0.929 - (0.016 * (90 -angle) / 45);
                buffer.color[1] = 0.843 - (0.185 * (90 -angle) / 45);
                buffer.color[2] = 0.239 - (0.039 * (90 -angle) / 45);
            }

        }

        gl.uniform4f(colorF,  buffer.color[0],   buffer.color[1],   buffer.color[2], buffer.color[3]);




    const aPosition = gl.getAttribLocation(program, "a_position");// Get the location of the shader variables

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer.position);
    gl.enableVertexAttribArray(aPosition);  // Enable the assignment to aPosition variable
    gl.vertexAttribPointer(aPosition, 2, type, normalize, stride, offset); // Assign the buffer object to aPosition variable

    gl.drawArrays(gl.TRIANGLE_FAN, offset, NumVertices); //draw them

    if(pressed.press2){ //for moving situations

        window.requestAnimationFrame(function (currentTime) {
            if(pressed.pressDefault){
                previousTime = currentTime;
                pressed.pressDefault = false;
            }
            let deltaAngle = ((currentTime - previousTime) / 1000.0)
                * degreesPerSecond;

            angle = (angle + deltaAngle) %90;
            //the saved time at which the last frame was drawn, previous time,
            previousTime = currentTime;
            drawScene(buffer, offset, NumVertices, boolChangeColor);  // to draw the next frame
        });
    }
    if(pressed.press1){//if i want it to stay in place

        window.requestAnimationFrame(function () {
            angle=0; //if shape does not move,angle have to be zero
            drawScene(buffer, offset, NumVertices);
            round.lRound1= true;
            round.lRound2= false;
            round.rRound1 = false;  //reset the all of value for the next spin in the correct order
            round.rRound2 = false
        });
    }
}

