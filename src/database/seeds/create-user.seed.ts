import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import * as bcrypt from 'bcrypt';

async function createUser() {
    const username = process.argv[2];
    const password = process.argv[3];

    if (!username || !password) {
        console.error('Usage: npm run create-user -- <username> <password>');
        process.exit(1);
    }

    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(User);

    const existing = await repo.findOne({ where: { username } });
    if (existing) {
        console.error(`User "${username}" already exists.`);
        await AppDataSource.destroy();
        process.exit(1);
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = repo.create({ username, passwordHash });
    await repo.save(user);

    console.log(`User "${username}" created successfully.`);
    await AppDataSource.destroy();
}

createUser().catch((err) => {
    console.error('Failed to create user:', err);
    process.exit(1);
});