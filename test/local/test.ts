const list = [4, 3, 2, 1];

async function you(num: number) {
    throw new Error("Oops!");
}

you(3)
    .then(() => {
        console.log("then...");
    })
    .catch(() => {
        console.log("catch...");
    });
