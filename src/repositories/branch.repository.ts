import { AppDataSource } from '../config/data-source';
import { Branch } from '../models/restaurant/branch.entity';
import { Repository } from 'typeorm';

export class BranchRepository {
	private branchRepo: Repository<Branch>;

	constructor() {
		this.branchRepo = AppDataSource.getRepository(Branch);
	}

	async createBranch(data: Partial<Branch>): Promise<Branch> {
		const branch = this.branchRepo.create(data);
		return await this.branchRepo.save(branch);
	}

	async getBranchById(branchId: number): Promise<Branch | null> {
		return await this.branchRepo.findOne({
			where: { branchId },
			relations: ['restaurant']
		});
	}

	async getBranchesByRestaurantId(restaurantId: number): Promise<Branch[]> {
		return await this.branchRepo.find({
			where: { restaurantId, isActive: true },
			relations: ['restaurant']
		});
	}

	async updateBranch(branchId: number, data: Partial<Branch>): Promise<Branch | null> {
		await this.branchRepo.update(branchId, data);
		return await this.getBranchById(branchId);
	}

	async deleteBranch(branchId: number): Promise<void> {
		await this.branchRepo.update(branchId, { isActive: false });
	}

	async searchBranches(query: string): Promise<Branch[]> {
		return await this.branchRepo
			.createQueryBuilder('branch')
			.leftJoinAndSelect('branch.restaurant', 'restaurant')
			.where('branch.name ILIKE :query', { query: `%${query}%` })
			.orWhere('branch.address ILIKE :query', { query: `%${query}%` })
			.andWhere('branch.isActive = :isActive', { isActive: true })
			.getMany();
	}
}
