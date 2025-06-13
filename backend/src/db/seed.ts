import { faker } from "@faker-js/faker";
import { db } from "./drizzle";
import { users, clients, tabs, payments } from "./schema";

async function seedDatabase() {
	// Limpar todas as tabelas (na ordem correta devido às foreign keys)
	await db.delete(payments);
	await db.delete(tabs);
	await db.delete(clients);
	await db.delete(users);

	console.log("🗑️  Dados anteriores removidos");

// Criar usuários
const createdUsers = [];
for (let i = 0; i < 3; i++) {
	const username = faker.internet.username();
	const [user] = await db.insert(users).values({
		username: username,
		password: faker.internet.password(),
	}).returning();
	
	createdUsers.push(user);
	console.log(`👤 User ${username} created`);
}

// Criar clientes
const createdClients = [];
for (let i = 0; i < 10; i++) {
	const name = faker.person.fullName();
	const [client] = await db.insert(clients).values({
		name: name,
		phone_number: faker.phone.number({style: "international"}),
	}).returning();
	
	createdClients.push(client);
	console.log(`👥 Client ${name} created`);
}

// Criar tabs (contas)
const createdTabs = [];
for (let i = 0; i < 20; i++) {
	const randomClient = faker.helpers.arrayElement(createdClients);
	const randomUser = faker.helpers.arrayElement(createdUsers);
	const value = faker.number.float({ min: 10, max: 500, fractionDigits: 2 });
	const status = faker.helpers.arrayElement(['paid', 'partial', 'unpaid']);
	
	const [tab] = await db.insert(tabs).values({
		client_id: randomClient.id,
		description: faker.commerce.productDescription(),
		value: value.toString(),
		status: status,
		created_by: randomUser.id,
	}).returning();
	
	createdTabs.push(tab);
	console.log(`📝 Tab for ${randomClient.name} created (${status}) - $${value}`);
}

// Criar pagamentos
for (let i = 0; i < 15; i++) {
	const randomTab = faker.helpers.arrayElement(createdTabs);
	const tabValue = Number.parseFloat(randomTab.value || "0");
	const paymentValue = faker.number.float({ 
		min: 5, 
		max: tabValue * 0.8, 
		fractionDigits: 2 
	});
	
	await db.insert(payments).values({
		tab_id: randomTab.id,
		value: paymentValue.toString(),
	});
	
	console.log(`💰 Payment of $${paymentValue} for tab ${randomTab.id} created`);
}

console.log("✅ Seed completed successfully!");
}

// Executar o seed
seedDatabase()
	.then(() => {
		console.log("🎉 Database seeded successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("❌ Error seeding database:", error);
		process.exit(1);
	});