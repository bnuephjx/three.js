import { Matrix4 } from '../math/Matrix4.js';
import { Object3D } from '../core/Object3D.js';

class Camera extends Object3D {

	constructor() {

		super();

		// 类型
		this.type = 'Camera';

		// matrixWorld矩阵的逆矩阵。 MatrixWorld包含了相机的世界变换矩阵
		this.matrixWorldInverse = new Matrix4();

		// 投影变换矩阵
		this.projectionMatrix = new Matrix4();

		// 投影变换矩阵的逆矩阵
		this.projectionMatrixInverse = new Matrix4();

	}

	/**
	 *
	 * @description 返回一个具有和当前相机的属性一样的新的相机
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} source
	 * @param {*} recursive
	 * @return {*} 
	 * @memberof Camera
	 */
	copy( source, recursive ) {

		super.copy( source, recursive );

		this.matrixWorldInverse.copy( source.matrixWorldInverse );

		this.projectionMatrix.copy( source.projectionMatrix );
		this.projectionMatrixInverse.copy( source.projectionMatrixInverse );

		return this;

	}

	/**
	 *
	 * @description 返回一个能够表示当前摄像机所正视的世界空间方向的Vector3对象。 
	 * （注意：摄像机俯视时，其Z轴坐标为负。）
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} target
	 * @return {*} 
	 * @memberof Camera
	 */
	getWorldDirection( target ) {

		this.updateWorldMatrix( true, false );

		const e = this.matrixWorld.elements;

		return target.set( - e[ 8 ], - e[ 9 ], - e[ 10 ] ).normalize();

	}

	/**
	 *
	 * @description 更新物体及其后代的全局变换
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @param {*} force 是否强制更新
	 * @memberof Camera
	 */
	updateMatrixWorld( force ) {

		super.updateMatrixWorld( force );

		this.matrixWorldInverse.copy( this.matrixWorld ).invert();

	}

	updateWorldMatrix( updateParents, updateChildren ) {

		super.updateWorldMatrix( updateParents, updateChildren );

		this.matrixWorldInverse.copy( this.matrixWorld ).invert();

	}

	clone() {

		return new this.constructor().copy( this );

	}

}

Camera.prototype.isCamera = true;

export { Camera };
