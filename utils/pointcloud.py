# Open3D: www.open3d.org
# The MIT License (MIT)
# See license file or visit www.open3d.org for details

import numpy as np
from open3d import *
from pdb import set_trace as st
import sys


def rotate90(points):
    theta = np.radians(90)
    c, s = np.cos(theta), np.sin(theta)
    # R = np.matrix([[c, -s,0], [s, c,0],[0,0,1]])
    R = np.matrix([[1,0,0],[0,c, -s], [0,s, c]])
    # st()
    points = np.dot(points, R.T)
    # st()
    return points


# def densify(file,d_file)

if __name__ == "__main__":

    print("Load a ply point cloud, print it, and render it")
    print(str(sys.argv[1]))
    #pcd = read_point_cloud("C:\\Users\\Tianyu\\Desktop\\fused.ply")
    pcd = read_point_cloud(str(sys.argv[1]))
    print(pcd)
    #draw_geometries([pcd])
    #print(np.asarray(pcd.points))
    # draw_geometries([pcd])
    additional_points = []
    additional_colors = []
    additional_normals = []
    #print("Downsample the point cloud with a voxel of 0.05")
    # downpcd = voxel_down_sample(pcd, voxel_size = 0.0005)
    # draw_geometries([downpcd])
    width = 0.005
    samples = 1
    points = np.asarray(pcd.points)
    normals = np.asarray(pcd.normals)
    colors = np.asarray(pcd.colors)
    for i in range(points.shape[0]):
        s_width = width / 2
        incr = s_width / 2
        for j in range(samples):
            pointL = points[i] + incr * j * normals[i]
            pointR = points[i] - incr * j * normals[i]
            additional_points.append(pointL)
            additional_points.append(pointR)
            # additional_colors.append(colors[i])
            # additional_colors.append(colors[i])
            additional_normals.append(normals[i])
            additional_normals.append(-normals[i])

    additional_points = np.array(additional_points)
    points = np.append(points,additional_points,axis=0)
    # colors = np.append(colors,np.array(additional_colors),axis=0)
    normals = np.append(normals,np.array(additional_normals),axis=0)
    # points = np.array(rotate90(points))
    # normals  = np.array(rotate90(normals))
    print("TEST")

            # Pass xyz to Open3D.PointCloud.points and visualize
    new_pcd = PointCloud()
    new_pcd.points = Vector3dVector(points)
    new_pcd.colors = Vector3dVector(colors)
    new_pcd.normals = Vector3dVector(normals)
    write_point_cloud("new_pcd3"+".ply", new_pcd, write_ascii=True)
    #draw_geometries([new_pcd])
    #print("")