import { Object3D } from '../core/Object3D.js';

class Scene extends Object3D {

	constructor() {

		super();

		this.type = 'Scene';

		// 若不为空，在渲染场景的时候将设置背景，且背景总是首先被渲染的。
		this.background = null;

		// 若该值不为null，则该纹理贴图将会被设为场景中所有物理材质的环境贴图。
		this.environment = null;

		// 一个fog实例定义了影响场景中的每个物体的雾的类型。默认值为null。
		this.fog = null;

		// 如果不为空，它将强制场景中的每个物体使用这里的材质来渲染。默认值为null。
		this.overrideMaterial = null;

		// 默认值为true，若设置了这个值，则渲染器会检查每一帧是否需要更新场景及其中物体的矩阵。 
		// 当设为false时，你必须亲自手动维护场景中的矩阵。
		this.autoUpdate = true; // checked by the renderer

		if ( typeof __THREE_DEVTOOLS__ !== 'undefined' ) {

			__THREE_DEVTOOLS__.dispatchEvent( new CustomEvent( 'observe', { detail: this } ) ); // eslint-disable-line no-undef

		}

	}

	copy( source, recursive ) {

		super.copy( source, recursive );

		if ( source.background !== null ) this.background = source.background.clone();
		if ( source.environment !== null ) this.environment = source.environment.clone();
		if ( source.fog !== null ) this.fog = source.fog.clone();

		if ( source.overrideMaterial !== null ) this.overrideMaterial = source.overrideMaterial.clone();

		this.autoUpdate = source.autoUpdate;
		this.matrixAutoUpdate = source.matrixAutoUpdate;

		return this;

	}

	toJSON( meta ) {

		const data = super.toJSON( meta );

		if ( this.fog !== null ) data.object.fog = this.fog.toJSON();

		return data;

	}

}

Scene.prototype.isScene = true;

export { Scene };
