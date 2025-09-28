const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');
const path = require('path');

const IMG_SIZE = 128;
const DATASET_DIR = './dataset';

function cargarImagenes() {
    const clases = ['vacia', 'marcada'];
    const imagenes = [];
    const etiquetas = [];

    clases.forEach((clase, idx) => {
        const folder = path.join(DATASET_DIR, clase);
        fs.readdirSync(folder).forEach(file => {
            const buffer = fs.readFileSync(path.join(folder, file));
            const imgTensor = tf.node.decodeImage(buffer)
                                  .resizeNearestNeighbor([IMG_SIZE, IMG_SIZE])
                                  .toFloat().div(255);
            imagenes.push(imgTensor);
            etiquetas.push(idx);
        });
    });

    return { xs: tf.stack(imagenes), ys: tf.tensor1d(etiquetas, 'int32') };
}

function crearModelo() {
    const model = tf.sequential();
    model.add(tf.layers.conv2d({inputShape:[IMG_SIZE,IMG_SIZE,3], filters:16, kernelSize:3, activation:'relu'}));
    model.add(tf.layers.maxPooling2d({poolSize:2}));
    model.add(tf.layers.conv2d({filters:32, kernelSize:3, activation:'relu'}));
    model.add(tf.layers.maxPooling2d({poolSize:2}));
    model.add(tf.layers.flatten());
    model.add(tf.layers.dense({units:64, activation:'relu'}));
    model.add(tf.layers.dense({units:2, activation:'softmax'}));
    model.compile({optimizer:'adam', loss:'sparseCategoricalCrossentropy', metrics:['accuracy']});
    return model;
}

async function main() {
    const { xs, ys } = cargarImagenes();
    const model = crearModelo();
    console.log("Entrenando modelo...");
    await model.fit(xs, ys, { epochs: 10, batchSize: 16, validationSplit: 0.2 });
    await model.save('file://./modelo_tfjs');
    console.log("Modelo entrenado y guardado en ./modelo_tfjs");
}

main();
