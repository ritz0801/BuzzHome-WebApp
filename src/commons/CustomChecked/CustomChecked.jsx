import { Button } from "antd";
import React from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";

function CustomChecked({ data, user, firestore }) {
	// get list checked by user
	const productRef = firestore.collection("user");
	const query = productRef.limit(25);
	const [values, loading] = useCollectionData(query, { idField: "id" });

	const countLikePostRef = firestore.collection("CountLikePost");
	const query2 = countLikePostRef.limit(100);

	const [countLikePost] = useCollectionData(query2, { idField: "id" });
	// return null when user no logged in
	if (!!!user) {
		return <></>;
	}

	// handle when user checked
	const handleSubmit = () => {
		const index = values.findIndex(
			(item) => item.id === `${user.uid}${data.id}`
		);

		const indexCount = countLikePost.findIndex(
			(item) => parseInt(item.id) === data.id
		);

		if (index >= 0) {
			console.log("28");
			if (values[index].isChecked) {
				console.log("30");
				if (indexCount >= 0) {
					console.log("32");
					countLikePostRef.doc(`${data.id}`).set({
						count: countLikePost[indexCount].count - 1,
					});
				}
			} else {
				console.log("38");
				if (indexCount >= 0) {
					console.log("40");
					countLikePostRef.doc(`${data.id}`).set({
						count: countLikePost[indexCount].count + 1,
					});
				} else {
					console.log("45");
					countLikePostRef.doc(`${data.id}`).set({
						count: 1,
					});
				}
			}

			firestore.collection("user").doc(`${user.uid}${data.id}`).set({
				isChecked: !values[index].isChecked,
			});
		} else {
			console.log("56");
			if (indexCount >= 0) {
				console.log("61");
				countLikePostRef.doc(`${data.id}`).set({
					count: countLikePost[indexCount].count + 1,
				});
			} else {
				console.log("66");
				countLikePostRef.doc(`${data.id}`).set({
					count: 1,
				});
			}

			firestore.collection("user").doc(`${user.uid}${data.id}`).set({
				isChecked: true,
			});
		}
	};

	return !loading ? (
		<div onClick={handleSubmit}>
			{values.findIndex((item) => item.id === `${user.uid}${data.id}`) >= 0 ? (
				values[values.findIndex((item) => item.id === `${user.uid}${data.id}`)]
					.isChecked ? (
					<Button type="primary" danger>
						Đã Quan Tâm
					</Button>
				) : (
					<Button type="primary">Quan Tâm</Button>
				)
			) : (
				<Button type="primary">Quan Tâm</Button>
			)}
		</div>
	) : (
		<></>
	);
}

export default CustomChecked;
