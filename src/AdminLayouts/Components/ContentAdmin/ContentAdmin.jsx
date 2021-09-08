import {
	Button,
	Layout,
	Modal,
	notification,
	Space,
	Table,
	Tooltip,
} from "antd";
import React, { useEffect, useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import { delelePost, getAllData } from "../../../api/house.api";
import { formatTime } from "../../../utils/function.utils";
import Loading from "../../../components/Loading/Loading";
import { Select } from "antd";
import { DISTRICT_LOCTION_OPTION } from "../../../utils/constant";
import "./ContentAdmin.scss"

const { Option } = Select;
const { Content } = Layout;

function ContentAdmin({ firebase, firestore }) {
	const [allPost, setAllPost] = useState([]);
	const [dataSource, setDataSource] = useState([]);
	const [deleteTicket, setDeleteTicket] = useState();
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [valueLocation, setValueLocation] = useState(null);

	const countLikePostRef = firestore.collection("CountLikePost");
	const query = countLikePostRef.limit(100);

	const [countLikePost, loading] = useCollectionData(query, { idField: "id" });

	useEffect(() => {
		(async () => {
			try {
				const result = await getAllData();

				if (result.count > 0) {
					setAllPost(result.rows);
					setDataSource(result.rows);
				}
			} catch (error) {
				console.log("false to fetch :", error);
			}
		})();
	}, [loading]);

	if (loading) {
		return <Loading />;
	}

	const FilterByDateInput = (
		<Select
			className="select-admin"
			value={valueLocation}
			placeholder="Vị trí"
			style={{ width: 150 }}
			onChange={(e) => {
				const currValue = e;
				setValueLocation(currValue);
				const filteredData = allPost.filter((entry) => entry.district === e);
				setDataSource(filteredData);
				if (e === "") setDataSource(allPost);
			}}
		>
			<Select.Option value={""}>Hủy bộ lọc</Select.Option>
			{DISTRICT_LOCTION_OPTION.map((item, index) => (
				<Select.Option key={index} value={item.value}>
					{item.name}
				</Select.Option>
			))}
		</Select>

		// <DatePicker
		// 	placeholder="Date Origin"
		// 	value={valueDate}
		// 	onChange={(e) => {
		// 		console.log(e);
		// 		const currValue = e;
		// 		setValueDate(currValue);
		// 		const filteredData = listBuses.filter(
		// 			(entry) =>
		// 				formatDate(new Date(entry.NgayDi)) ===
		// 				formatDate(new Date(currValue._d))
		// 		);
		// 		setDataSource(filteredData);
		// 	}}
		// />
	);

	const columns = [
		{
			title: "ID",
			dataIndex: "id",
			key: "id",
		},
		{
			title: FilterByDateInput,
			dataIndex: "district",
			key: "district",
			with: "20%",
			render: (district) => <>{district === "" ? "Hồ Chí Minh" : district}</>,
		},
		{
			title: "Giá",
			dataIndex: "price",
			key: "price",
		},
		{
			title: "Nội dung",
			dataIndex: "content",
			key: "content",
			ellipsis: {
				showTitle: false,
			},
			render: (content) => <Tooltip placement="topLeft">{content}</Tooltip>,
		},
		{
			title: "Ngày tạo",
			dataIndex: "createdAt",
			key: "createdAt",
			render: (createdAt) => <>{formatTime(createdAt)} </>,
		},
		{
			title: "Người đăng",
			dataIndex: "username",
			key: "username",
		},
		{
			title: "Số lượt quan tâm",
			dataIndex: "id",
			key: "id",
			render: (id) => {
				const index = countLikePost.find((item) => parseInt(item.id) === id);

				if (!!index) {
					return index.count;
				} else {
					return 0;
				}
			},
			sorter: (a, b) => {
				// console.log(a.id, b.id);
				const indexA = countLikePost.find((item) => parseInt(item.id) === a.id);
				const indexB = countLikePost.find((item) => parseInt(item.id) === b.id);

				let vA = !!indexA ? indexA.count : 0;
				let vB = !!indexB ? indexB.count : 0;
				return vA - vB;
			},
		},
		{
			title: "Chức năng",
			dataIndex: "id",
			key: "id",
			render: (id) => (
				<Space size="middle">
					<Button type="text" danger onClick={() => handleDeletePost(id)}>
						Xoá
					</Button>
				</Space>
			),
		},
	];

	const handleDeletePost = async (id) => {
		setDeleteTicket(id);
		setIsModalVisible(true);
	};

	const handleOk = async () => {
		const result = await delelePost(deleteTicket);
	
		if (result === "OK") {
		  const temp = allPost.filter((item) => item.id !== deleteTicket);
		  setAllPost(temp);
		  setDataSource(temp);
		  setIsModalVisible(false);
		  return notification.success({
			message: "Xóa thàng công",
		  });
		} else {
		  return notification.error({
			message: "Xóa thất bại",
		  });
		}
	  };

	const handleCancel = () => {
		setIsModalVisible(false);
	};

	return (
		<Layout style={{ padding: "0 24px 24px" }}>
			<Content
				className="site-layout-background"
				style={{
					padding: 24,
					margin: 0,
					minHeight: 280,
				}}
			>
				<Table
					rowKey={(record) => {
						return record.id;
					}}
					dataSource={dataSource}
					style={{
						overflowX: "auto",
						backgroundColor: "#ffffff",
						borderRadius: "10px",
						padding: "1rem",
					}}
					pagination={{
						pageSize: 8,
					}}
					columns={columns}
				/>
			</Content>

			<Modal
				closable={false}
				visible={isModalVisible}
				onOk={handleOk}
				onCancel={handleCancel}
				className="modalBox"
				footer={[
					<Button key="back" onClick={handleCancel}>
						Quay lại
					</Button>,
					<Button key="submit" type="primary" onClick={handleOk}>
						Xóa
					</Button>,
				]}
			>
				<div className="modalBox__title">Đồng ý xóa bài viết</div>
			</Modal>
		</Layout>
	);
}

export default ContentAdmin;
