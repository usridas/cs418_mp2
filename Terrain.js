/**
 * @fileoverview Terrain - A simple 3D terrain using WebGL
 * @author Eric Shaffer
 */

/** Class implementing 3D terrain. */
class Terrain{
/**
 * Initialize members of a Terrain object
 * @param {number} div Number of triangles along x axis and y axis
 * @param {number} minX Minimum X coordinate value
 * @param {number} maxX Maximum X coordinate value
 * @param {number} minY Minimum Y coordinate value
 * @param {number} maxY Maximum Y coordinate value
 */
    constructor(div,minX,maxX,minY,maxY){
        this.div = div;
        this.minX=minX;
        this.minY=minY;
        this.maxX=maxX;
        this.maxY=maxY;

        // Allocate vertex array
        this.vBuffer = [];
        // Allocate triangle array
        this.fBuffer = [];
        // Allocate normal array
        this.nBuffer = [];
        // Allocate array for edges so we can draw wireframe
        this.eBuffer = [];
        console.log("Terrain: Allocated buffers");

        this.generateTriangles();
        console.log("Terrain: Generated triangles");

        //this.setNormals();
        //console.log("Terrain: Set new normals")

        this.generateLines();
        console.log("Terrain: Generated lines");

        // Get extension for 4 byte integer indices for drwElements
        var ext = gl.getExtension('OES_element_index_uint');
        if (ext ==null){
            alert("OES_element_index_uint is unsupported by your browser and terrain generation cannot proceed.");
        }
    }

    /**
    * Set the x,y,z coords of a vertex at location(i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    setVertex(v,i,j)
    {
        //Your code here
       var coord = 3*((i * (this.div + 1)) + j); //Just like transforming 2d array to 1d array
       this.vBuffer[coord] = v[0]; //x
       this.vBuffer[coord + 1] = v[1]; //y
       this.vBuffer[coord + 2] = v[2]; //z
    }

    /**
    * Return the x,y,z coordinates of a vertex at location (i,j)
    * @param {Object} v an an array of length 3 holding x,y,z coordinates
    * @param {number} i the ith row of vertices
    * @param {number} j the jth column of vertices
    */
    getVertex(v,i,j)
    {
        //Your code here
        var coord = 3*((i * (this.div + 1)) + j); //Just like transforming 2d array to 1d array
        v[0] = this.vBuffer[coord]; //x
        v[1] = this.vBuffer[coord + 1]; //y
        v[2] = this.vBuffer[coord + 2]; //z
    }

    /**
    * Send the buffer objects to WebGL for rendering
    */
    loadBuffers()
    {
        // Specify the vertex coordinates
        this.VertexPositionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.vBuffer), gl.STATIC_DRAW);
        this.VertexPositionBuffer.itemSize = 3;
        this.VertexPositionBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexPositionBuffer.numItems, " vertices");

        // Specify normals to be able to do lighting calculations
        this.VertexNormalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.nBuffer),
                  gl.STATIC_DRAW);
        this.VertexNormalBuffer.itemSize = 3;
        this.VertexNormalBuffer.numItems = this.numVertices;
        console.log("Loaded ", this.VertexNormalBuffer.numItems, " normals");

        // Specify faces of the terrain
        this.IndexTriBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.fBuffer),
                  gl.STATIC_DRAW);
        this.IndexTriBuffer.itemSize = 1;
        this.IndexTriBuffer.numItems = this.fBuffer.length;
        console.log("Loaded ", this.IndexTriBuffer.numItems, " triangles");

        //Setup Edges
        this.IndexEdgeBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint32Array(this.eBuffer),
                  gl.STATIC_DRAW);
        this.IndexEdgeBuffer.itemSize = 1;
        this.IndexEdgeBuffer.numItems = this.eBuffer.length;

        console.log("triangulatedPlane: loadBuffers");
    }

    /**
    * Render the triangles
    */
    drawTriangles(){
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize,
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);

        //Draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexTriBuffer);
        gl.drawElements(gl.TRIANGLES, this.IndexTriBuffer.numItems, gl.UNSIGNED_INT,0);
    }

    /**
    * Render the triangle edges wireframe style
    */
    drawEdges(){

        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexPositionBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.VertexPositionBuffer.itemSize,
                         gl.FLOAT, false, 0, 0);

        // Bind normal buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.VertexNormalBuffer);
        gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute,
                           this.VertexNormalBuffer.itemSize,
                           gl.FLOAT, false, 0, 0);

        //Draw
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.IndexEdgeBuffer);
        gl.drawElements(gl.LINES, this.IndexEdgeBuffer.numItems, gl.UNSIGNED_INT,0);
    }
/**
 * Fill the vertex and  triangle arrays
 */
generateTriangles()
{
    //Your code here
    var i = 0;
    var j = 0;
    for (j = 0; j <= this.div; j++)
    {
      for (i = 0; i <= this.div; i++)
      {
        //Basic equation is (i*width) + j
        this.vBuffer.push((i*((this.maxX - this.minX)/this.div)) + this.minX); //x coords: (max-min)/div = width of each triangle
        this.vBuffer.push((j*((this.maxY - this.minY)/this.div)) + this.minY); //y coords: (max-min)/div = height of each triangle
        this.vBuffer.push(0); //All z coords start as zero

        this.nBuffer.push(0); //x normal default
        this.nBuffer.push(0); //y normal default
        this.nBuffer.push(1); //z normal default
      }
    }
    i = 0; //reset i
    j = 0; //reset j
    for (j = 0; j < this.div; j++)
    {
      for (i = 0; i < this.div; i++)
      {
        //Basic equation is (j*width) + i
        this.fBuffer.push((j*(this.div + 1)) + i);
        this.fBuffer.push((j*(this.div + 1)) + i + 1);
        this.fBuffer.push((j*(this.div + 1)) + i + this.div + 1);

        this.fBuffer.push((j*(this.div + 1)) + i + 1);
        this.fBuffer.push((j*(this.div + 1)) + i + this.div + 2);
        this.fBuffer.push((j*(this.div + 1)) + i + this.div + 1);
      }
    }
    this.numVertices = this.vBuffer.length/3;
    this.numFaces = this.fBuffer.length/3;

    this.setHeight();
    //this.updateVertices();
    this.setNormals();
}

/**
* Set random heights via random partition (100 iterations)
*/
setHeight()
{
  var i = 0;
  var j = 0;
  var p = glMatrix.vec3.create();
  var b = glMatrix.vec3.create();
  var norm = glMatrix.vec3.create();
  var subvec = glMatrix.vec3.create();
  for(j = 0; j <= 100; j++) //Try 100 iterations
  {
    for(i = 0; i < this.numVertices; i++)
    {
      p[0] = Math.floor(Math.random() * this.maxX) + this.minX; //random x between min and max
      p[1] = Math.floor(Math.random() * this.maxY) + this.minY; //random y between min and max
      b = [this.vBuffer[3*i], this.vBuffer[(3*i) + 1]];
      glMatrix.vec3.sub(subvec, b, p);
      norm[0] = Math.floor(Math.random() * this.maxX) + this.minX; //random x norm
      norm[1] = Math.floor(Math.random() * this.maxY) + this.minY; //random y norm
      //if (glMatrix.vec3.dot(subvec, norm) > 0) //(b−p)⋅n>0
      if (Math.random() > 0.5)
      {
        this.vBuffer[(3*i) + 2] = this.vBuffer[(3*i) + 2] + 0.005; //Increment height by 0.005
      }
      else
      {
        this.vBuffer[(3*i) + 2] = this.vBuffer[(3*i) + 2] - 0.005; //Decrement height by 0.005
      }
    }
  }
}

setNormals()
{
  var i = 0;
  var nor = glMatrix.vec3.create(); //New normal
  var line1 = glMatrix.vec3.create(); //We need 2 out of 3 sides of a triangle to calculate normal
  var line2 = glMatrix.vec3.create(); //We need 2 out of 3 sides of a triangle to calculate normal

  for (i = 0; i < this.numFaces; i++)
  {
    var v1 = [this.vBuffer[3 * this.fBuffer[3*i]], this.vBuffer[(3 * this.fBuffer[3*i]) + 1], this.vBuffer[(3 * this.fBuffer[3*i]) + 2]]; //First vertex of face
    var v2 = [this.vBuffer[3 * this.fBuffer[(3*i) + 1]], this.vBuffer[(3 * this.fBuffer[(3*i) + 1]) + 1], this.vBuffer[(3 * this.fBuffer[(3*i) + 1]) + 2]]; //Second vertex of face
    var v3 = [this.vBuffer[3 * this.fBuffer[(3*i) + 2]], this.vBuffer[(3 * this.fBuffer[(3*i) + 2]) + 1], this.vBuffer[(3 * this.fBuffer[(3*i) + 2]) + 2]]; //Third vertex of face

    //Get two lines (v2, v1)(v2, v3)
    glMatrix.vec3.sub(line1, v1, v2); //This is line v1 - v2
    glMatrix.vec3.sub(line2, v3, v2); //This is line v3 - v2
    glMatrix.vec3.cross(nor, line1, line2); //Cross product is the new normal

    var nor1 = [this.nBuffer[3 * this.fBuffer[3*i]], this.nBuffer[(3 * this.fBuffer[3*i]) + 1], this.nBuffer[(3 * this.fBuffer[3*i]) + 2]]; //First normal of face
    var nor2 = [this.nBuffer[3 * this.fBuffer[(3*i) + 1]], this.nBuffer[(3 * this.fBuffer[(3*i) + 1]) + 1], this.nBuffer[(3 * this.fBuffer[(3*i) + 1]) + 2]]; //Second normal of face
    var nor3 = [this.nBuffer[3 * this.fBuffer[(3*i) + 2]], this.nBuffer[(3 * this.fBuffer[(3*i) + 2]) + 1], this.nBuffer[(3 * this.fBuffer[(3*i) + 2]) + 2]]; //Third normal of face

    glMatrix.vec3.add(nor1, nor1, nor); //Add new and old normals
    glMatrix.vec3.add(nor2, nor2, nor); //Add new and old normals
    glMatrix.vec3.add(nor3, nor3, nor); //Add new and old normals
  }

  i = 0; //reset i
  for (i = 0; i < this.numVertices; i++)
  {
    var newnorm = [this.nBuffer[3*i], this.nBuffer[(3*i) + 1], this.nBuffer[(3*i) + 2]];
    glMatrix.vec3.normalize(newnorm, newnorm); //Unit length
    this.nBuffer[3*i] = newnorm[0]; //Set new values for normalized normal
    this.nBuffer[(3*i) + 1] = newnorm[1]; //Set new values for normalized normal
    this.nBuffer[(3*i) + 2] = newnorm[2]; //Set new values for normalized normal
  }
}


//HALP ME
/**
 * Generate the plane by randomly devide the vertices
 */
 // updateVertices()
 // {
 //   // Number of iterations
 //   var it = 100;
 //   // Adjustment of each iteration
 //   var delta = 0.005;
 //
 //   for (var i = 0; i < it; i++) {
 //     var p = [Math.random() * (this.maxX - this.minX) + this.minX, Math.random() * (this.maxY - this.minY) + this.minY];
 //     var n = glMatrix.vec2.create();
 //     glMatrix.vec2.random(n);
 //     for (var j = 0; j < this.numVertices; j++) {
 //       var b = [this.vBuffer[j * 3], this.vBuffer[j * 3 + 1]];
 //       if ((b[0] - p[0]) * n[0] + (b[1] - p[1]) * n[1] > 0) {
 //         this.vBuffer[(3*j) + 2] = this.vBuffer[(3*j) + 2] + 0.005;
 //         //this.vBuffer[j * 3 + 2] += 0.005;
 //       } else {
 //         this.vBuffer[(3*j) + 2] = this.vBuffer[(3*j) + 2] - 0.005;
 //         //this.vBuffer[j * 3 + 2] -= 0.005;
 //       }
 //     }
 //   }
 // }
//PLEASE HALP ME


/**
 * Print vertices and triangles to console for debugging
 */
printBuffers()
    {

    for(var i=0;i<this.numVertices;i++)
          {
           console.log("v ", this.vBuffer[i*3], " ",
                             this.vBuffer[i*3 + 1], " ",
                             this.vBuffer[i*3 + 2], " ");

          }

      for(var i=0;i<this.numFaces;i++)
          {
           console.log("f ", this.fBuffer[i*3], " ",
                             this.fBuffer[i*3 + 1], " ",
                             this.fBuffer[i*3 + 2], " ");

          }

    }

/**
 * Generates line values from faces in faceArray
 * to enable wireframe rendering
 */
generateLines()
{
    var numTris=this.fBuffer.length/3;
    for(var f=0;f<numTris;f++)
    {
        var fid=f*3;
        this.eBuffer.push(this.fBuffer[fid]);
        this.eBuffer.push(this.fBuffer[fid+1]);

        this.eBuffer.push(this.fBuffer[fid+1]);
        this.eBuffer.push(this.fBuffer[fid+2]);

        this.eBuffer.push(this.fBuffer[fid+2]);
        this.eBuffer.push(this.fBuffer[fid]);
    }

}

}
