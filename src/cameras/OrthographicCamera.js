import { Camera } from './Camera.js';

class OrthographicCamera extends Camera {

	constructor( left = - 1, right = 1, top = 1, bottom = - 1, near = 0.1, far = 2000 ) {

		super();

		// 类型
		this.type = 'OrthographicCamera';

		// 获取或者设置摄像机的缩放倍数，其默认值为1。
		this.zoom = 1;

		// 这个值是由setViewOffset来设置的，其默认值为null
		this.view = null;

		// 摄像机视锥体左侧面
		this.left = left;

		// 摄像机视锥体右侧面。
		this.right = right;

		// 摄像机视锥体上侧面
		this.top = top;

		// 摄像机视锥体下侧面
		this.bottom = bottom;

		// 摄像机视锥体近端面。其默认值为0.1
		// 其值的有效范围介于0和far（摄像机视锥体远端面）之间。
		// 请注意，和PerspectiveCamera不同，0对于OrthographicCamera的近端面来说是一个有效值。
		this.near = near;

		// 摄像机视锥体远端面，其默认值为2000。
		// 该值必须大于near 的值。
		this.far = far;

		this.updateProjectionMatrix();

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		this.left = source.left;
		this.right = source.right;
		this.top = source.top;
		this.bottom = source.bottom;
		this.near = source.near;
		this.far = source.far;

		this.zoom = source.zoom;
		this.view = source.view === null ? null : Object.assign( {}, source.view );

		return this;

	}

	setViewOffset( fullWidth, fullHeight, x, y, width, height ) {

		if ( this.view === null ) {

			this.view = {
				enabled: true,
				fullWidth: 1,
				fullHeight: 1,
				offsetX: 0,
				offsetY: 0,
				width: 1,
				height: 1
			};

		}

		this.view.enabled = true;
		this.view.fullWidth = fullWidth;
		this.view.fullHeight = fullHeight;
		this.view.offsetX = x;
		this.view.offsetY = y;
		this.view.width = width;
		this.view.height = height;

		this.updateProjectionMatrix();

	}

	/**
	 *
	 * @description 清除任何由.setViewOffset设置的偏移量
	 * @author (Set the text for this tag by adding docthis.authorName to your settings file.)
	 * @memberof OrthographicCamera
	 */
	clearViewOffset() {

		if ( this.view !== null ) {

			this.view.enabled = false;

		}

		this.updateProjectionMatrix();

	}

	updateProjectionMatrix() {

		const dx = ( this.right - this.left ) / ( 2 * this.zoom );
		const dy = ( this.top - this.bottom ) / ( 2 * this.zoom );
		const cx = ( this.right + this.left ) / 2;
		const cy = ( this.top + this.bottom ) / 2;

		let left = cx - dx;
		let right = cx + dx;
		let top = cy + dy;
		let bottom = cy - dy;

		if ( this.view !== null && this.view.enabled ) {

			const scaleW = ( this.right - this.left ) / this.view.fullWidth / this.zoom;
			const scaleH = ( this.top - this.bottom ) / this.view.fullHeight / this.zoom;

			left += scaleW * this.view.offsetX;
			right = left + scaleW * this.view.width;
			top -= scaleH * this.view.offsetY;
			bottom = top - scaleH * this.view.height;

		}

		this.projectionMatrix.makeOrthographic( left, right, top, bottom, this.near, this.far );

		this.projectionMatrixInverse.copy( this.projectionMatrix ).invert();

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		data.object.zoom = this.zoom;
		data.object.left = this.left;
		data.object.right = this.right;
		data.object.top = this.top;
		data.object.bottom = this.bottom;
		data.object.near = this.near;
		data.object.far = this.far;

		if ( this.view !== null ) data.object.view = Object.assign( {}, this.view );

		return data;

	}

}

OrthographicCamera.prototype.isOrthographicCamera = true;

export { OrthographicCamera };
