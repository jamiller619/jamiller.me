import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import {
	Color,
	Group,
	MathUtils,
	Mesh,
	Quaternion,
	ShaderMaterial,
	Vector3,
} from 'three';
import styles from './Scene.module.css';

const projects = [
	{ title: 'Xon', colors: ['#7c3aed', '#ec4899', '#312e81'] },
	{ title: 'Repose', colors: ['#2563eb', '#06b6d4', '#172554'] },
	{ title: 'Suzy', colors: ['#84cc16', '#14b8a6', '#134e4a'] },
	{ title: 'Jamiller.me', colors: ['#f97316', '#eab308', '#713f12'] },
	{ title: 'Field Notes', colors: ['#db2777', '#f43f5e', '#4c0519'] },
	{ title: 'Interface Study', colors: ['#0891b2', '#6366f1', '#312e81'] },
	{ title: 'Open Source', colors: ['#eab308', '#f97316', '#7c2d12'] },
	{ title: 'Experiments', colors: ['#dc2626', '#9333ea', '#581c87'] },
] as const;

const vertexShader = `
	varying vec2 vUv;

	void main() {
		vUv = uv;
		gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
	}
`;

const fragmentShader = `
	uniform float uTime;
	uniform vec3 uColorA;
	uniform vec3 uColorB;
	uniform vec3 uColorC;
	varying vec2 vUv;

	void main() {
		vec2 glowCenter = vec2(
			0.5 + sin(uTime * 0.16) * 0.22,
			0.5 + cos(uTime * 0.13) * 0.22
		);
		float sweep = 0.5 + 0.5 * sin(
			(vUv.x * 0.8 + vUv.y * 0.55) * 3.14159 + uTime * 0.18
		);
		float glow = 1.0 - smoothstep(0.0, 0.85, distance(vUv, glowCenter));

		vec3 gradient = mix(uColorC, uColorA, vUv.y * 0.65 + 0.2);
		gradient = mix(gradient, uColorB, smoothstep(0.08, 0.92, sweep) * 0.72);
		gradient += glow * 0.12;

		gl_FragColor = vec4(gradient, 1.0);
	}
`;

const globeRadius = 14;
const latitudeLimit = 0.42;
const columnCount = 24;
const rowsPerColumn = 4;
const animationSpeed = 0.5;
const globeRotationSpeed = 0.04 * animationSpeed;
const forward = new Vector3(0, 0, 1);

interface ProjectCardProps {
	columnIndex: number;
	projectIndex: number;
	slotIndex: number;
	title: string;
	colors: readonly [string, string, string];
}

function ProjectCard({
	columnIndex,
	projectIndex,
	slotIndex,
	title,
	colors,
}: ProjectCardProps) {
	const mesh = useRef<Mesh>(null);
	const material = useRef<ShaderMaterial>(null);
	const hovered = useRef(false);
	const hoverProgress = useRef(0);
	const normal = useMemo(() => new Vector3(), []);
	const orientation = useMemo(() => new Quaternion(), []);
	const uniforms = useMemo(
		() => ({
			uTime: { value: 0 },
			uColorA: { value: new Color(colors[0]) },
			uColorB: { value: new Color(colors[1]) },
			uColorC: { value: new Color(colors[2]) },
		}),
		[colors],
	);

	useFrame(({ clock }, delta) => {
		if (!mesh.current || !material.current) return;

		const elapsed = clock.getElapsedTime();
		const animationTime = elapsed * animationSpeed;
		const direction = columnIndex % 2 === 0 ? 1 : -1;
		const cycle = latitudeLimit * 2;
		const initialLatitude =
			-latitudeLimit + ((slotIndex + 0.5) / rowsPerColumn) * cycle;
		const unwrappedLatitude =
			initialLatitude + direction * animationTime * 0.025;
		const latitude =
			((((unwrappedLatitude + latitudeLimit) % cycle) + cycle) % cycle) -
			latitudeLimit;
		const longitude = -Math.PI + (columnIndex / columnCount) * Math.PI * 2;

		mesh.current.position.set(
			globeRadius * Math.sin(longitude),
			globeRadius * Math.sin(latitude),
			globeRadius * Math.cos(longitude),
		);

		normal.set(Math.sin(longitude), 0, Math.cos(longitude));
		orientation.setFromUnitVectors(forward, normal);
		mesh.current.quaternion.copy(orientation);

		hoverProgress.current = MathUtils.damp(
			hoverProgress.current,
			hovered.current ? 1 : 0,
			8,
			delta,
		);
		mesh.current.position.addScaledVector(normal, hoverProgress.current * 0.55);
		mesh.current.scale.setScalar(1 + hoverProgress.current * 0.14);
		material.current.uniforms.uTime.value =
			animationTime + projectIndex * 0.8;
	});

	return (
		<mesh
			ref={mesh}
			name={title}
			onPointerOut={() => {
				hovered.current = false;
				document.documentElement.style.cursor = '';
			}}
			onPointerOver={(event) => {
				event.stopPropagation();
				hovered.current = true;
				document.documentElement.style.cursor = 'pointer';
			}}
		>
			<planeGeometry args={[2.55, 1.9125, 1, 1]} />
			<shaderMaterial
				ref={material}
				fragmentShader={fragmentShader}
				uniforms={uniforms}
				vertexShader={vertexShader}
			/>
		</mesh>
	);
}

function PortfolioGrid() {
	const globe = useRef<Group>(null);

	useFrame(({ clock }) => {
		if (globe.current) {
			globe.current.rotation.y =
				clock.getElapsedTime() * globeRotationSpeed;
		}
	});

	return (
		<group ref={globe} position={[0, 0, -globeRadius]}>
			{Array.from({ length: columnCount }, (_, columnIndex) =>
				Array.from({ length: rowsPerColumn }, (_, slotIndex) => {
					const projectIndex =
						(columnIndex * rowsPerColumn + slotIndex) % projects.length;
					const project = projects[projectIndex];

					return (
						<ProjectCard
							colors={project.colors}
							columnIndex={columnIndex}
							key={`${columnIndex}-${slotIndex}`}
							projectIndex={projectIndex}
							slotIndex={slotIndex}
							title={project.title}
						/>
					);
				}),
			)}
		</group>
	);
}

export default function Scene() {
	return (
		<section className={styles.root} aria-label="Selected work">
			<ul className="sr-only">
				{projects.map((project) => (
					<li key={project.title}>{project.title}</li>
				))}
			</ul>
			<Canvas
				camera={{ position: [0, 0, 9.2], fov: 43 }}
				dpr={[1, 2]}
				gl={{ alpha: true, antialias: true }}
			>
				<PortfolioGrid />
			</Canvas>
		</section>
	);
}
