import { AppDataSource } from '../data-source';
import { MitreTechnique } from '../entities/mitre-technique.entity';

const STIX_URL =
    'https://raw.githubusercontent.com/mitre-attack/attack-stix-data/master/enterprise-attack/enterprise-attack.json';

function formatTactic(phaseName: string): string {
    return phaseName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

async function seed() {
    console.log('Downloading MITRE ATT&CK STIX dataset...');
    const response = await fetch(STIX_URL);
    if (!response.ok) {
        throw new Error(`Failed to download STIX data: ${response.status}`);
    }
    const bundle = await response.json();

    console.log(`Parsing ${bundle.objects.length} STIX objects...`);

    const techniques: Partial<MitreTechnique>[] = [];

    for (const obj of bundle.objects) {
        if (obj.type !== 'attack-pattern') continue;
        if (obj.revoked || obj.x_mitre_deprecated) continue;

        const externalRef = obj.external_references?.find(
            (ref: any) => ref.source_name === 'mitre-attack',
        );
        if (!externalRef?.external_id) continue;

        const tactic = obj.kill_chain_phases?.[0]?.phase_name
            ? formatTactic(obj.kill_chain_phases[0].phase_name)
            : 'Unknown';

        techniques.push({
            techniqueId: externalRef.external_id,
            tactic,
            name: obj.name,
            description: obj.description ?? null,
        });
    }

    console.log(`Found ${techniques.length} valid techniques. Inserting...`);

    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(MitreTechnique);

    let inserted = 0;
    for (const technique of techniques) {
        await repo
            .createQueryBuilder()
            .insert()
            .into(MitreTechnique)
            .values(technique)
            .orIgnore() // skip if techniqueId already exists
            .execute();
        inserted++;
    }

    console.log(`Seed complete: ${inserted} techniques processed.`);
    await AppDataSource.destroy();
}

seed().catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
});