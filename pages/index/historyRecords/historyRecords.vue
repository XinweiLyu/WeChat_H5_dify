<template>
	<!-- #ifdef APP -->
	<scroll-view style="flex:1">
	<!-- #endif -->
		
	<!-- #ifdef APP -->
	</scroll-view>
	<!-- #endif -->
	<view>
		<view class="header">
			<text class="title">历史检测记录</text>
		</view>
		<view class="history-list">
			<view v-for="record in historyRecords" :key="record.id" class="record">
				<text>{{ record.date }}</text>
				<button @click="viewPdf(record.pdfUrl)">查看PDF报告</button>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		data() {
			return {
				historyRecords: [
					{ id: 1, date: '2025-05-01', pdfUrl: '/path/to/report1.pdf' },
					{ id: 2, date: '2025-05-02', pdfUrl: '/path/to/report2.pdf' },
					// 添加更多记录
				]
			}
		},
		// methods: {
		// 	viewPdf(pdfUrl) {
		// 		// #ifdef MP-WEIXIN
		// 		const filePath = pdfUrl || '/static/report.pdf'; // 使用本地PDF文件作为占位符
		// 		wx.openDocument({
		// 			filePath: filePath,
		// 			success: function (res) {
		// 				console.log('打开文档成功');
		// 			},
		// 			fail: function (err) {
		// 				console.error('打开文档失败', err);
		// 			}
		// 		});
		// 		// #endif
		// 	}
		// }
		
		  // methods: {
		  //   async fetchHistoryRecords() {
		  //     this.loading = true;
		  //     try {
		  //       // 假设API端点是 /api/history
		  //       const response = await get('/api/history');
		  //       this.historyRecords = response;
		  //     } catch (error) {
		  //       this.error = '获取历史记录失败，请重试';
		  //       console.error('获取历史记录失败:', error);
		  //     } finally {
		  //       this.loading = false;
		  //     }
		  //   }
		  // },
		  // onLoad() {
		  //   this.fetchHistoryRecords();
		  // }
		
		
		
	}
</script>

<style>
	.header {
		text-align: center;
		margin: 20px 0;
	}

	.title {
		font-size: 24px;
		color: #333;
	}

	.history-list {
		margin: 20px;
	}

	.record {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin: 10px 0;
		padding: 10px;
		border-bottom: 1px solid #ccc;
	}

	button {
		padding: 5px 10px;
		font-size: 14px;
	}
</style>
