import { Form, InputNumber, Modal, notification } from "antd";
import React, { useState } from "react";
import { useCollectionData } from "react-firebase-hooks/firestore";
import postApi from "../../api/postApi";
import { makeCode } from "../../utils/function.utils";
import "../SignInForm/style/SignInForm.scss";
const emailExistence = require("email-existence");

function SignUpForm({ auth, firebase }) {
	const listUserRef = firebase.firestore().collection("listUser");
	const query = listUserRef.limit(25);
	const [listUser] = useCollectionData(query, { idField: "id" });
	const [info, setInfo] = useState({ email: "", password: "" });
	const [code, setCode] = useState([false, 0]);
	const [loading, setLoading] = useState(false);

	// handle  sign in with google
	const SignInWithGoogle = () => {
		const provider = new firebase.auth.GoogleAuthProvider();
		auth
			.signInWithPopup(provider)
			.then(async ({ user }) => {
				const index = listUser.findIndex((item) => item.uid === user.uid);

				if (index > -1) {
					if (listUser[index].status !== "block") {
						return notification.success({
							message: "Đăng kí thành công",
							description: "",
						});
					} else {
						auth.signOut();
						return notification.error({
							message: "Không thể đăng nhập",
							description:
								"Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn cộng đồng",
						});
					}
				} else {
					await listUserRef.add({
						uid: user.uid,
						email: user.email,
						status: "live",
					});
					return notification.success({
						message: "Đăng kí thành công",
						description: "",
					});
				}
			})
			.catch((error) => {
				let errorCode = "Fail";
				let errorMessage = error.message;

				return notification.error({
					message: errorCode,
					description: errorMessage,
				});
			});
	};

	// function sign up with email
	const signUp = async (values) => {
		console.log(values);
		const { email, password } = info;

		if (values.code === code[1]) {
			auth
				.createUserWithEmailAndPassword(email, password)
				.then(async ({ user }) => {
					const index = listUser.findIndex((item) => item.uid === user.uid);
					if (index > -1) {
						if (listUser[index].status !== "block") {
							return notification.success({
								message: "Đăng kí thành công",
								description: "",
							});
						} else {
							auth.signOut();
							return notification.error({
								message: "Không thể đăng nhập",
								description:
									"Tài khoản của bạn đã bị khóa do vi phạm tiêu chuẩn cộng đồng",
							});
						}
					} else {
						await listUserRef.add({
							uid: user.uid,
							email: user.email,
							status: "live",
						});
						return notification.success({
							message: "Đăng kí thành công",
							description: "",
						});
					}
				})
				.catch((error) => {
					let errorCode = "Fail";
					let errorMessage = error.message;
					return notification.error({
						message: "Đăng ký thất bại",
						// description: errorMessage,
					});
				});
		} else {
			return notification.error({
				message: "Sai mã xác nhận",
				// description: errorMessage,
			});
		}
	};

	// handle sign up with email
	const onFinishSendEmail = async (values) => {
		//signUp(values.email, values.password);
		setLoading(true);
		const randomCode = await makeCode();

		const rs = await postApi.handleSendCode({
			email: values.email,
			code: randomCode,
		});
		console.log(rs);
		if (rs.status) {
			setInfo({ email: values.email, password: values.password });
			setCode([true, randomCode]);
			setLoading(false);
		} else {
			setLoading(false);
			return notification.error({
				message: "Gửi code thất bại",
			});
		}
	};

	const cancleSendCode = () => {
		setCode([false, 0]);
	};

	return (
		<div className="form">
			{code[0] === false ? (
				<>
					<Form className="form__form" onFinish={onFinishSendEmail}>
						<div className="form__label">Email</div>
						<Form.Item
							name="email"
							rules={[
								{
									required: true,
									type: "email",
									message: "Please input your email!",
								},
							]}
						>
							<input className="form__input" />
						</Form.Item>

						<div className="form__label">Password</div>
						<Form.Item
							name="password"
							rules={[
								{
									required: true,
									message: "Please input your password!",
								},
							]}
						>
							<input type="password" className="form__input" />
						</Form.Item>

						<div className="form__label">Re Password</div>
						<Form.Item
							name="confirm"
							dependencies={["password"]}
							hasFeedback
							rules={[
								{
									required: true,
									message: "Please confirm your password!",
								},
								({ getFieldValue }) => ({
									validator(_, value) {
										if (!value || getFieldValue("password") === value) {
											return Promise.resolve();
										}
										return Promise.reject(
											new Error(
												"The two passwords that you entered do not match!"
											)
										);
									},
								}),
							]}
						>
							<input type="password" className="form__input" />
						</Form.Item>

						<Form.Item>
							<button
								className={`form__button primary ${loading ? "disabled" : ""}`}
								htmlType="submit"
							>
								Đăng ký
							</button>
						</Form.Item>
					</Form>

					<button
						onClick={SignInWithGoogle}
						className={`form__button google ${loading ? "disabled" : ""}`}
					>
						Đăng Nhập với Google
					</button>
				</>
			) : (
				<div className="form">
					<Form className="form__form" onFinish={signUp}>
						<div className="form__label">Nhập mã nhận được trong email</div>
						<Form.Item
							name="code"
							rules={[
								{
									required: true,
									type: "number",
									message: "Hãy nhập code vào!",
								},
							]}
						>
							<InputNumber className="form__input" controls={false} />
							{/* <input className="form__input" /> */}
						</Form.Item>

						<Form.Item>
							<button className="form__button primary" htmlType="submit">
								Xác nhận
							</button>
						</Form.Item>
						<button onClick={cancleSendCode} className="form__button google">
							Đăng ký tài khoản khác
						</button>
					</Form>
				</div>
			)}
		</div>
	);
}

export default SignUpForm;
