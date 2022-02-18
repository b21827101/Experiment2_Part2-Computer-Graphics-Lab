
// Vertex shader program
const vsSource = `#version 300 es
    in vec2 a_position;  // position of the vertex in coordinate system
    uniform vec2 uScalingFactor;  //scaling vector 
    uniform vec2 uRotationVector;  //rotated position of the vertex
    uniform vec4 vColor;
    out vec4 fColor;
    void main() {
       
        vec2 rotatedPosition = vec2(
            a_position.x * uRotationVector.y +
            a_position.y * uRotationVector.x,
            a_position.y * uRotationVector.y -
            a_position.x * uRotationVector.x
        );

     gl_Position = vec4(rotatedPosition * uScalingFactor, 0.0, 1.0); //set to the transformed and rotated vertex's position
     fColor = vColor;
    }
`;

// Fragment shader program
const fsSource = `#version 300 es
    precision mediump float;

    uniform vec4 fColor;
    out vec4 fragColor;

    void main()
    {
        fragColor = fColor;
    }
`;


