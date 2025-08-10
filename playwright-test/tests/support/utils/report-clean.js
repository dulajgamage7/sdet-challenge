import { existsSync, remove } from 'fs-extra';
import { join } from 'path';

export default async () => {
    // Use current working directory instead of relative path from this script
    const projectRoot = process.cwd();
    const allureResultsPath = join(projectRoot, 'allure-results');
    const allureReportPath = join(projectRoot, 'allure-report');

    try {
        console.log('Cleaning up old allure folders...');
        console.log(`Working directory: ${projectRoot}`);

        if (existsSync(allureResultsPath)) {
            await remove(allureResultsPath);
            console.log('✅ Deleted: allure-results');
        } else {
            console.log('ℹ️ No allure-results folder found');
        }

        if (existsSync(allureReportPath)) {
            await remove(allureReportPath);
            console.log('✅ Deleted: allure-report');
        } else {
            console.log('ℹ️ No allure-report folder found');
        }
    } catch (err) {
        console.error('❌ Error during cleanup:', err);
    }
};
