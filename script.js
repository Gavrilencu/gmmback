
document.getElementById('productForm').addEventListener('submit', function (e) {
    e.preventDefault();
    const httpMethod = document.getElementById('httpMethod').value;
    switch (httpMethod) {
        case 'GET':
            fetchProducts();
            break;
        case 'POST':
            addProduct();
            break;
        case 'PUT':
            const productId = document.getElementById('productId').value;
            if (productId) {
                updateProduct(productId);
            } else {
                alert('ID produs necesar pentru actualizare.');
            }
            break;
        case 'DELETE':
            const deleteId = document.getElementById('productId').value;
            if (deleteId) {
                deleteProduct(deleteId);
            } else {
                alert('ID produs necesar pentru ștergere.');
            }
            break;
        default:
            alert('Selectați o metodă HTTP validă.');
    }
});
function addProduct() {
    const productData = {
        category: document.getElementById('category').value,
        name: document.getElementById('name').value,
        code: document.getElementById('code').value,
        description: document.getElementById('description').value
    };

    fetch('http://localhost:3000/products', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    })
        .then(response => response.json())
        .then(data => {
            clearForm();
            fetchProducts();
            alert('Produs adăugat cu succes!');
        })
        .catch((error) => {
            console.error('Eroare:', error);
        });
}

function updateProduct(id) {
    const productData = {
        category: document.getElementById('category').value,
        name: document.getElementById('name').value,
        code: document.getElementById('code').value,
        description: document.getElementById('description').value
    };

    fetch(`http://localhost:3000/products/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(productData)
    })
        .then(response => response.json())
        .then(data => {
            clearForm();
            fetchProducts();
            alert('Produs actualizat cu succes!');
        })
        .catch((error) => {
            console.error('Eroare:', error);
        });
}

function deleteProduct(id) {
    fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE'
    })
        .then(response => response.json())
        .then(data => {
            fetchProducts();
            alert('Produs șters cu succes!');
        })
        .catch((error) => {
            console.error('Eroare:', error);
        });
}

function editProduct(id) {
    fetch(`http://localhost:3000/products/${id}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('productId').value = data.id;
            document.getElementById('category').value = data.category;
            document.getElementById('name').value = data.name;
            document.getElementById('code').value = data.code;
            document.getElementById('description').value = data.description;
        })
        .catch((error) => {
            console.error('Eroare:', error);
        });
}

function clearForm() {
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
}

function fetchProducts() {
    fetch('http://localhost:3000/products')
        .then(response => response.json())
        .then(products => {
            const productList = document.getElementById('productsList');
            productList.innerHTML = '';
            products.forEach(product => {
                productList.innerHTML += `
                    <div class="product">
                        <h3>${product.name}</h3>
                        <p>Categorie: ${product.category}</p>
                        <p>Cod: ${product.code}</p>
                        <p>Descriere: ${product.description}</p>
                        <button onclick="editProduct(${product.id})">Editează</button>
                        <button onclick="deleteProduct(${product.id})">Șterge</button>
                    </div>
                `;
            });
        });
}

fetchProducts();
