#!/usr/bin/env node

/**
 * パフォーマンステストスクリプト
 * Node.js環境でのパフォーマンス測定とボトルネック特定
 */

const fs = require('fs');
const path = require('path');

class PerformanceTestRunner {
    constructor() {
        this.results = {
            fileAnalysis: {},
            cssAnalysis: {},
            jsAnalysis: {},
            assetAnalysis: {},
            recommendations: []
        };
    }

    // ファイルサイズ分析
    analyzeFileSizes() {
        console.log('📊 ファイルサイズ分析中...');
        
        const files = [
            'index.html',
            'styles.css',
            'integration-test.html',
            'test-responsive.html'
        ];

        files.forEach(file => {
            if (fs.existsSync(file)) {
                const stats = fs.statSync(file);
                const sizeKB = Math.round(stats.size / 1024 * 100) / 100;
                
                this.results.fileAnalysis[file] = {
                    size: sizeKB,
                    status: this.evaluateFileSize(file, sizeKB)
                };
                
                console.log(`  ${file}: ${sizeKB}KB - ${this.results.fileAnalysis[file].status}`);
            }
        });
    }

    evaluateFileSize(filename, sizeKB) {
        const limits = {
            'index.html': 100,  // 100KB以下が理想
            'styles.css': 50,   // 50KB以下が理想
            'integration-test.html': 150,
            'test-responsive.html': 30
        };

        const limit = limits[filename] || 50;
        if (sizeKB <= limit) return '✅ 良好';
        if (sizeKB <= limit * 1.5) return '⚠️ 注意';
        return '❌ 改善必要';
    }

    // CSS分析
    analyzeCSSPerformance() {
        console.log('🎨 CSS パフォーマンス分析中...');
        
        if (!fs.existsSync('styles.css')) {
            console.log('  styles.css が見つかりません');
            return;
        }

        const cssContent = fs.readFileSync('styles.css', 'utf8');
        
        // CSS分析指標
        const analysis = {
            totalLines: cssContent.split('\n').length,
            totalRules: (cssContent.match(/\{[^}]*\}/g) || []).length,
            mediaQueries: (cssContent.match(/@media[^{]*\{/g) || []).length,
            keyframes: (cssContent.match(/@keyframes[^{]*\{/g) || []).length,
            willChangeUsage: (cssContent.match(/will-change\s*:/g) || []).length,
            transformUsage: (cssContent.match(/transform\s*:/g) || []).length,
            animationUsage: (cssContent.match(/animation\s*:/g) || []).length,
            transitionUsage: (cssContent.match(/transition\s*:/g) || []).length,
            complexSelectors: (cssContent.match(/[^{]*\s+[^{]*\s+[^{]*\s+[^{]*\{/g) || []).length,
            importantUsage: (cssContent.match(/!important/g) || []).length
        };

        this.results.cssAnalysis = analysis;

        console.log(`  総行数: ${analysis.totalLines}`);
        console.log(`  CSSルール数: ${analysis.totalRules}`);
        console.log(`  メディアクエリ数: ${analysis.mediaQueries}`);
        console.log(`  キーフレーム数: ${analysis.keyframes}`);
        console.log(`  will-change使用: ${analysis.willChangeUsage}箇所`);
        console.log(`  transform使用: ${analysis.transformUsage}箇所`);
        console.log(`  animation使用: ${analysis.animationUsage}箇所`);
        console.log(`  transition使用: ${analysis.transitionUsage}箇所`);
        console.log(`  複雑なセレクタ: ${analysis.complexSelectors}箇所`);
        console.log(`  !important使用: ${analysis.importantUsage}箇所`);

        // パフォーマンス評価
        this.evaluateCSSPerformance(analysis);
    }

    evaluateCSSPerformance(analysis) {
        // パフォーマンス最適化の推奨事項
        if (analysis.willChangeUsage < analysis.animationUsage) {
            this.results.recommendations.push({
                type: 'CSS',
                priority: 'high',
                message: 'アニメーション要素にwill-changeプロパティの追加を推奨'
            });
        }

        if (analysis.complexSelectors > 10) {
            this.results.recommendations.push({
                type: 'CSS',
                priority: 'medium',
                message: '複雑なセレクタが多数検出されました。シンプルなセレクタの使用を推奨'
            });
        }

        if (analysis.importantUsage > 5) {
            this.results.recommendations.push({
                type: 'CSS',
                priority: 'medium',
                message: '!importantの使用が多数検出されました。CSS設計の見直しを推奨'
            });
        }

        if (analysis.totalRules > 500) {
            this.results.recommendations.push({
                type: 'CSS',
                priority: 'low',
                message: 'CSSルール数が多いです。未使用CSSの削除を検討してください'
            });
        }
    }

    // JavaScript分析
    analyzeJSPerformance() {
        console.log('⚡ JavaScript パフォーマンス分析中...');
        
        if (!fs.existsSync('index.html')) {
            console.log('  index.html が見つかりません');
            return;
        }

        const htmlContent = fs.readFileSync('index.html', 'utf8');
        
        // JavaScript分析（HTMLに埋め込まれたスクリプト）
        const scriptMatches = htmlContent.match(/<script[^>]*>([\s\S]*?)<\/script>/gi) || [];
        
        let totalJSLines = 0;
        let eventListeners = 0;
        let setTimeoutUsage = 0;
        let setIntervalUsage = 0;
        let animationFrameUsage = 0;
        let domQueries = 0;

        scriptMatches.forEach(script => {
            const scriptContent = script.replace(/<\/?script[^>]*>/gi, '');
            totalJSLines += scriptContent.split('\n').length;
            
            eventListeners += (scriptContent.match(/addEventListener/g) || []).length;
            setTimeoutUsage += (scriptContent.match(/setTimeout/g) || []).length;
            setIntervalUsage += (scriptContent.match(/setInterval/g) || []).length;
            animationFrameUsage += (scriptContent.match(/requestAnimationFrame/g) || []).length;
            domQueries += (scriptContent.match(/querySelector|getElementById|getElementsBy/g) || []).length;
        });

        const analysis = {
            totalLines: totalJSLines,
            eventListeners,
            setTimeoutUsage,
            setIntervalUsage,
            animationFrameUsage,
            domQueries,
            scriptTags: scriptMatches.length
        };

        this.results.jsAnalysis = analysis;

        console.log(`  JavaScript総行数: ${analysis.totalLines}`);
        console.log(`  スクリプトタグ数: ${analysis.scriptTags}`);
        console.log(`  イベントリスナー: ${analysis.eventListeners}箇所`);
        console.log(`  setTimeout使用: ${analysis.setTimeoutUsage}箇所`);
        console.log(`  setInterval使用: ${analysis.setIntervalUsage}箇所`);
        console.log(`  requestAnimationFrame使用: ${analysis.animationFrameUsage}箇所`);
        console.log(`  DOM クエリ: ${analysis.domQueries}箇所`);

        this.evaluateJSPerformance(analysis);
    }

    evaluateJSPerformance(analysis) {
        if (analysis.animationFrameUsage === 0 && analysis.setTimeoutUsage > 0) {
            this.results.recommendations.push({
                type: 'JavaScript',
                priority: 'high',
                message: 'アニメーションにはsetTimeoutではなくrequestAnimationFrameの使用を推奨'
            });
        }

        if (analysis.setIntervalUsage > 0) {
            this.results.recommendations.push({
                type: 'JavaScript',
                priority: 'medium',
                message: 'setIntervalの使用が検出されました。パフォーマンスへの影響を確認してください'
            });
        }

        if (analysis.domQueries > 20) {
            this.results.recommendations.push({
                type: 'JavaScript',
                priority: 'medium',
                message: 'DOM クエリが多数検出されました。要素の再利用を検討してください'
            });
        }

        if (analysis.totalLines > 1000) {
            this.results.recommendations.push({
                type: 'JavaScript',
                priority: 'low',
                message: 'JavaScript コードが大きいです。外部ファイルへの分離を検討してください'
            });
        }
    }

    // アセット分析
    analyzeAssets() {
        console.log('🖼️ アセット分析中...');
        
        const assetsDir = 'assets';
        if (!fs.existsSync(assetsDir)) {
            console.log('  assets ディレクトリが見つかりません');
            return;
        }

        const assets = fs.readdirSync(assetsDir);
        let totalSize = 0;
        const assetDetails = {};

        assets.forEach(asset => {
            const assetPath = path.join(assetsDir, asset);
            const stats = fs.statSync(assetPath);
            const sizeKB = Math.round(stats.size / 1024 * 100) / 100;
            totalSize += sizeKB;

            assetDetails[asset] = {
                size: sizeKB,
                type: path.extname(asset).toLowerCase(),
                status: this.evaluateAssetSize(asset, sizeKB)
            };

            console.log(`  ${asset}: ${sizeKB}KB - ${assetDetails[asset].status}`);
        });

        this.results.assetAnalysis = {
            totalAssets: assets.length,
            totalSize: Math.round(totalSize * 100) / 100,
            details: assetDetails
        };

        console.log(`  総アセット数: ${assets.length}`);
        console.log(`  総サイズ: ${this.results.assetAnalysis.totalSize}KB`);

        this.evaluateAssetPerformance();
    }

    evaluateAssetSize(filename, sizeKB) {
        const ext = path.extname(filename).toLowerCase();
        
        const limits = {
            '.gif': 2000,  // 2MB以下が理想
            '.png': 500,   // 500KB以下が理想
            '.jpg': 300,   // 300KB以下が理想
            '.jpeg': 300,
            '.webp': 200   // 200KB以下が理想
        };

        const limit = limits[ext] || 500;
        if (sizeKB <= limit) return '✅ 良好';
        if (sizeKB <= limit * 1.5) return '⚠️ 注意';
        return '❌ 改善必要';
    }

    evaluateAssetPerformance() {
        const analysis = this.results.assetAnalysis;
        
        if (analysis.totalSize > 5000) { // 5MB以上
            this.results.recommendations.push({
                type: 'Assets',
                priority: 'high',
                message: 'アセットの総サイズが大きいです。画像の最適化を推奨'
            });
        }

        // 大きなファイルの特定
        Object.entries(analysis.details).forEach(([filename, details]) => {
            if (details.status === '❌ 改善必要') {
                this.results.recommendations.push({
                    type: 'Assets',
                    priority: 'medium',
                    message: `${filename} のサイズが大きいです (${details.size}KB)`
                });
            }
        });

        // WebP形式の推奨
        const hasWebP = Object.keys(analysis.details).some(filename => 
            path.extname(filename).toLowerCase() === '.webp'
        );
        
        if (!hasWebP && analysis.totalAssets > 0) {
            this.results.recommendations.push({
                type: 'Assets',
                priority: 'low',
                message: 'WebP形式の画像使用を検討してください（ファイルサイズ削減）'
            });
        }
    }

    // 総合評価とレポート生成
    generateReport() {
        console.log('\n📋 パフォーマンステストレポート');
        console.log('='.repeat(50));

        // 総合スコア計算
        let score = 100;
        
        this.results.recommendations.forEach(rec => {
            switch(rec.priority) {
                case 'high': score -= 15; break;
                case 'medium': score -= 10; break;
                case 'low': score -= 5; break;
            }
        });

        score = Math.max(0, score);

        console.log(`\n🎯 総合パフォーマンススコア: ${score}/100`);
        
        if (score >= 90) console.log('   ✅ 優秀 - パフォーマンスは非常に良好です');
        else if (score >= 70) console.log('   ⚠️ 良好 - 軽微な改善の余地があります');
        else if (score >= 50) console.log('   ⚠️ 注意 - パフォーマンス改善が必要です');
        else console.log('   ❌ 要改善 - 重要なパフォーマンス問題があります');

        // 推奨事項の表示
        if (this.results.recommendations.length > 0) {
            console.log('\n🔧 改善推奨事項:');
            
            const priorityOrder = ['high', 'medium', 'low'];
            priorityOrder.forEach(priority => {
                const recs = this.results.recommendations.filter(r => r.priority === priority);
                if (recs.length > 0) {
                    console.log(`\n  ${priority.toUpperCase()} 優先度:`);
                    recs.forEach((rec, index) => {
                        console.log(`    ${index + 1}. [${rec.type}] ${rec.message}`);
                    });
                }
            });
        } else {
            console.log('\n✅ 改善推奨事項はありません');
        }

        // 詳細統計
        console.log('\n📊 詳細統計:');
        console.log(`  ファイル分析: ${Object.keys(this.results.fileAnalysis).length}ファイル`);
        console.log(`  CSS ルール数: ${this.results.cssAnalysis.totalRules || 'N/A'}`);
        console.log(`  JavaScript 行数: ${this.results.jsAnalysis.totalLines || 'N/A'}`);
        console.log(`  アセット総サイズ: ${this.results.assetAnalysis.totalSize || 'N/A'}KB`);

        // JSONレポート出力
        this.saveJSONReport(score);
    }

    saveJSONReport(score) {
        const report = {
            timestamp: new Date().toISOString(),
            score: score,
            summary: {
                totalFiles: Object.keys(this.results.fileAnalysis).length,
                totalRecommendations: this.results.recommendations.length,
                highPriorityIssues: this.results.recommendations.filter(r => r.priority === 'high').length,
                mediumPriorityIssues: this.results.recommendations.filter(r => r.priority === 'medium').length,
                lowPriorityIssues: this.results.recommendations.filter(r => r.priority === 'low').length
            },
            details: this.results
        };

        const reportPath = 'performance-report.json';
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`\n💾 詳細レポートを ${reportPath} に保存しました`);
    }

    // メインテスト実行
    async run() {
        console.log('🚀 UI Animation Enhancement - パフォーマンステスト開始\n');
        
        try {
            this.analyzeFileSizes();
            console.log('');
            
            this.analyzeCSSPerformance();
            console.log('');
            
            this.analyzeJSPerformance();
            console.log('');
            
            this.analyzeAssets();
            console.log('');
            
            this.generateReport();
            
            console.log('\n✅ パフォーマンステスト完了');
            
        } catch (error) {
            console.error('❌ テスト実行中にエラーが発生しました:', error.message);
            process.exit(1);
        }
    }
}

// スクリプトが直接実行された場合
if (require.main === module) {
    const testRunner = new PerformanceTestRunner();
    testRunner.run();
}

module.exports = PerformanceTestRunner;
