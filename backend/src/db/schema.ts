import {text, varchar, timestamp, pgEnum, uuid, decimal, pgTable } from "drizzle-orm/pg-core"

export const statusEnum = pgEnum("paymentStatus", ["paid", "partial", "unpaid"]);


export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    username: varchar("username", {length: 255}).notNull(),
    password: varchar("password", {length: 100}).notNull(),
    created_at: timestamp("created_at").defaultNow(),
});

export const clients = pgTable("clients", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", {length: 255}).notNull(),
    phone_number: varchar("phone_number", {length: 14}).notNull(),
    updated_at: timestamp("updated_at").defaultNow(),
    created_at: timestamp("created_at").defaultNow(),
});

export const tabs = pgTable("tabs", {
    id: uuid("id").primaryKey().defaultRandom(),
    client_id: uuid("client_id").references(() => clients.id, {onDelete: "set null"}),
    description: text("description"),
    value: decimal("value", { precision: 10, scale: 2}),
    status: statusEnum("status").notNull().default("unpaid"),
    created_by: uuid("created_by").references(() => users.id, {onDelete: "set null"}),
    updated_at: timestamp("updated_at").defaultNow(),
    created_at: timestamp("created_at").defaultNow(),
})

export const payments = pgTable("payments", {
    id: uuid("id").primaryKey().defaultRandom(),
    tab_id: uuid("tab_id").references(() => tabs.id, {onDelete: "cascade"}),
    value: decimal("value", {precision: 10, scale: 2}),
    description: text("description"),
    created_at: timestamp("created_at").defaultNow(),  
})