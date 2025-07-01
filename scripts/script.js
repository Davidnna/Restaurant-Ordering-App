const menu = document.getElementById("menu");
const orders = document.getElementById("orders");
const payment = document.getElementById("payment");
const complete = document.getElementById("complete");
const rate = document.getElementById("rate");

let cart = {};
const discount = 5;

function showMenu() {
	menuArray.forEach(function (item) {
		menu.innerHTML += `
			<div class="item">
				<div class="text">
					<span class="emoji">${item.emoji}</span>
					<div class="h">
						<h2>${item.name}</h2>
						<p>${item.ingredients.join(", ")}</p>
						<h3>$${item.price}</h3>
					</div>
				</div>
				<button type="button" class="add" data-add="${item.id}" id="${item.id}">+</button>
			</div>
		`;
	});
}

showMenu();

document.addEventListener("click", function (e) {
	if (e.target.dataset.add) {
		addOrder(e.target.dataset.add);
	} else if (e.target.classList.contains("remove")) {
		removeOrder(e.target.dataset.id);
	} else if (e.target.id === "check-out") {
		checkOut();
	} else if ((payment.innerHTML !== "" && !payment.contains(e.target)) || (rate.innerHTML !== "" && !rate.contains(e.target)) || e.target.classList.contains("close")) {
		close();
	} else if (e.target.classList.contains("star")) {
        const value = e.target.dataset.value;
        document.getElementById("rating").value = value;
        // Highlight stars up to the selected one
        document.querySelectorAll(".star").forEach(star => {
            star.style.color = star.dataset.value <= value ? "#FFD700" : "#757575";
        });
    }
});

// Function to add an order to the cart
function addOrder(id) {
	const item = menuArray.find(i => i.id == id);
	
	if (cart[id]) {
		cart[id].quantity++;
	} else {
		cart[id] = { quantity: 1, item };
	}

	renderOrderList();
}

function removeOrder(id) {
	if (cart[id]) {
		cart[id].quantity--;
		if (cart[id].quantity === 0) delete cart[id];
		renderOrderList();
	}
}

function renderOrderList() {
	const items = Object.values(cart);
	complete.innerHTML = "";
	
	if (items.length === 0) {
		orders.innerHTML = "";
		return;
	}

	let subtotal = 0;
	let orderCount = 0;

	let listHTML = items.map(({ item, quantity }) => {
		const totalItemPrice = item.price * quantity;
		subtotal += totalItemPrice;
		orderCount += quantity;
		
		return `
			<div class="order">
				<h2>${item.name} (x${quantity})
					<button type="button" class="remove" data-id="${item.id}">remove</button>
				</h2>
				<h3>$${totalItemPrice}</h3>
			</div>
		`;
	}).join("");

	const discountAmount = Math.floor(subtotal / 20) * discount;
	const total = subtotal - discountAmount;

	// Initial rendering of the order list
	orders.innerHTML = `
		<h2>Your Order</h2>
		<div class="order-list" id="order-list">${listHTML}</div>
		<div class="order subtotal">
			<h2>Sub Total: </h2>
			<h3>$${subtotal}</h3>
		</div>
		${discountAmount > 0 ? `
			<div class="order">
				<h2>Discount</h2>
				<h3>-$${discountAmount}</h3>
			</div>
		` : ""}
		<div class="order">
			<h2>Total Price: </h2>
			<h3>$${total}</h3>
		</div>
		<button type="button" class="check-out" id="check-out">Check Out</button>
	`;
}

// Function to handle the checkout process
function checkOut() {
	payment.innerHTML = `
		<form id="form">
			<button type="button" class="close" id="close">X</button>
			<h3>Enter Card Details</h3>
			<label for="name">Enter your name</label>
			<input type="text" id="name" name="name" placeholder="eg. John Doe" required>
			<label for="card">Enter card number</label>
			<input type="text" id="card" class="number" name="card" placeholder="eg. XXXX-XXXX-XXXX-XXXX" maxlength="19" required>
			<label for="cvv">Enter CVV</label>
			<input type="text" id="cvv" class="number" name="cvv" placeholder="eg. 123" maxlength="4" required>
			<button type="submit" class="pay">Pay</button>
		</form>
	`;
}

function close() {
	payment.innerHTML = "";
	rate.innerHTML = "";
}

document.addEventListener("submit", function (e) {
	e.preventDefault()

	// If the form is submitted, we assume it's the payment form
	if (e.target.id === "form") {
		cart = {};
		renderOrderList();
		complete.innerHTML = `
			<div class="completed">
				<h3>Thanks, ${document.getElementById("name").value}! Your order is on its way!</h3>
				<p>Your card ending in ${document.getElementById("card").value.slice(-4)} has been charged.</p>
			</div>
		`;
		close()

		// Show the rating form after payment
		rate.innerHTML = `
			<form id="rate-form">
				<button type="button" class="close" id="close">X</button>
				<h3>Rate Your Experience</h3>
				<label for="rating">Rating (Very Bad to Very Good):</label>
				<input type="text" class="number" id="rating" name="rating" maxlength="1" required>
				<div class="stars" style="font-size:2rem; margin: 1em 0;">
					<span class="star" data-value="1">&#9733;</span>
					<span class="star" data-value="2">&#9733;</span>
					<span class="star" data-value="3">&#9733;</span>
					<span class="star" data-value="4">&#9733;</span>
					<span class="star" data-value="5">&#9733;</span>
				</div>
				<label for="feedback">Feedback:</label>
				<textarea id="feedback" name="feedback" required></textarea>
				<button type="submit" class="rates">Submit</button>
			</form>
		`;
	} else if (e.target.id === "rate-form") {
		complete.innerHTML += `
			<div class="completed">
				<h3>Thank you For your Feedback</h3>
			</div>
		`;
		close();
	}
})

document.addEventListener("input", function (e) {
	if (e.target.classList.contains("number")) {
		let value = e.target.value.replace(/\D/g, "");
		if (value.length > 0) {
			value = value.match(/.{1,4}/g).join("-");
		}
		value = value.slice(0, 19);
		e.target.value = value;
	}
})

function checkWrap(text) {
	// If the height of the flex container is greater than the height of its first child, it wrapped
	if (text.children.length > 1 && text.scrollHeight > text.firstElementChild.scrollHeight + 2) {
		text.classList.add('wrapped');
	} else {
		text.classList.remove('wrapped');
	}
}

function checkAllItems() {
	document.querySelectorAll('.text').forEach(checkWrap);
	document.querySelectorAll('.item').forEach(checkWrap);
	document.querySelectorAll('.order').forEach(checkWrap);
}

// Initial check
checkAllItems();

// Re-check on window resize
window.addEventListener('resize', checkAllItems);